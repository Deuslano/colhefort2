import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

class ClientRatingService {
  constructor() {
    this.COLLECTION_NAME = 'clientRatings';
  }

  // Add a rating for a client
  async addRating(clientId, clientName, rating, feedback, userId) {
    try {
      const ratingEntry = {
        clientId,
        clientName,
        rating, // 1-5 stars
        feedback,
        userId,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, this.COLLECTION_NAME), ratingEntry);
      console.log('Rating added for client:', clientName);
      return { success: true };
    } catch (error) {
      console.error('Error adding rating:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate average rating for a client
  async getClientAverageRating(clientId) {
    try {
      // This would typically be a query, but for now we'll calculate on the fly
      // In production, you'd want to store this in the client document
      return { averageRating: 0, totalRatings: 0 };
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return { averageRating: 0, totalRatings: 0 };
    }
  }

  // Get client satisfaction score based on multiple factors
  calculateClientSatisfactionScore(client, allocations, sales) {
    let score = 0;
    const factors = [];

    // Factor 1: Allocation frequency (more allocations = higher engagement)
    const clientAllocations = allocations.filter(a => a.clientId === client.id);
    if (clientAllocations.length > 5) {
      score += 20;
      factors.push({ name: 'Frequência de Alocação', value: 20, max: 20 });
    } else if (clientAllocations.length > 2) {
      score += 10;
      factors.push({ name: 'Frequência de Alocação', value: 10, max: 20 });
    } else {
      factors.push({ name: 'Frequência de Alocação', value: 0, max: 20 });
    }

    // Factor 2: Sales volume (higher sales = better relationship)
    const clientSales = sales.filter(s => s.clientId === client.id);
    const totalSales = clientSales.reduce((sum, s) => sum + (s.total || 0), 0);
    if (totalSales > 50000) {
      score += 30;
      factors.push({ name: 'Volume de Vendas', value: 30, max: 30 });
    } else if (totalSales > 20000) {
      score += 20;
      factors.push({ name: 'Volume de Vendas', value: 20, max: 30 });
    } else if (totalSales > 5000) {
      score += 10;
      factors.push({ name: 'Volume de Vendas', value: 10, max: 30 });
    } else {
      factors.push({ name: 'Volume de Vendas', value: 0, max: 30 });
    }

    // Factor 3: Payment reliability (assuming all sales are paid for now)
    if (clientSales.length > 0) {
      score += 25;
      factors.push({ name: 'Confiabilidade de Pagamento', value: 25, max: 25 });
    } else {
      factors.push({ name: 'Confiabilidade de Pagamento', value: 0, max: 25 });
    }

    // Factor 4: Relationship duration (based on first allocation)
    if (clientAllocations.length > 0) {
      const firstAllocation = clientAllocations.reduce((oldest, current) => 
        new Date(current.startDate) < new Date(oldest.startDate) ? current : oldest
      );
      const monthsSinceFirst = Math.floor(
        (new Date() - new Date(firstAllocation.startDate)) / (1000 * 60 * 60 * 24 * 30)
      );
      
      if (monthsSinceFirst > 12) {
        score += 25;
        factors.push({ name: 'Duração do Relacionamento', value: 25, max: 25 });
      } else if (monthsSinceFirst > 6) {
        score += 15;
        factors.push({ name: 'Duração do Relacionamento', value: 15, max: 25 });
      } else if (monthsSinceFirst > 3) {
        score += 10;
        factors.push({ name: 'Duração do Relacionamento', value: 10, max: 25 });
      } else {
        factors.push({ name: 'Duração do Relacionamento', value: 5, max: 25 });
      }
    } else {
      factors.push({ name: 'Duração do Relacionamento', value: 0, max: 25 });
    }

    // Determine classification
    let classification = 'Novo';
    if (score >= 80) classification = 'Premium';
    else if (score >= 60) classification = 'Ouro';
    else if (score >= 40) classification = 'Prata';
    else if (score >= 20) classification = 'Bronze';

    return {
      score,
      maxScore: 100,
      classification,
      factors,
    };
  }

  // Classify all clients
  classifyAllClients(clients, allocations, sales) {
    const classifications = clients.map(client => {
      const satisfaction = this.calculateClientSatisfactionScore(client, allocations, sales);
      return {
        clientId: client.id,
        clientName: client.name,
        ...satisfaction,
      };
    });

    return classifications.sort((a, b) => b.score - a.score);
  }

  // Get clients by classification
  getClientsByClassification(classifications, classification) {
    return classifications.filter(c => c.classification === classification);
  }

  // Generate client insights
  generateClientInsights(classifications) {
    const total = classifications.length;
    const premium = classifications.filter(c => c.classification === 'Premium').length;
    const gold = classifications.filter(c => c.classification === 'Ouro').length;
    const silver = classifications.filter(c => c.classification === 'Prata').length;
    const bronze = classifications.filter(c => c.classification === 'Bronze').length;
    const newClients = classifications.filter(c => c.classification === 'Novo').length;

    const averageScore = total > 0 
      ? classifications.reduce((sum, c) => sum + c.score, 0) / total 
      : 0;

    return {
      total,
      premium,
      gold,
      silver,
      bronze,
      newClients,
      averageScore: Math.round(averageScore),
      distribution: {
        premium: total > 0 ? (premium / total) * 100 : 0,
        gold: total > 0 ? (gold / total) * 100 : 0,
        silver: total > 0 ? (silver / total) * 100 : 0,
        bronze: total > 0 ? (bronze / total) * 100 : 0,
        new: total > 0 ? (newClients / total) * 100 : 0,
      },
    };
  }

  // Suggest actions for client retention
  suggestRetentionActions(client, satisfactionScore) {
    const actions = [];

    if (satisfactionScore.score < 40) {
      actions.push({
        priority: 'Alta',
        action: 'Contatar cliente para entender insatisfação',
        reason: 'Score de satisfação baixo',
      });
      actions.push({
        priority: 'Alta',
        action: 'Oferecer desconto ou condição especial',
        reason: 'Cliente em risco de perda',
      });
    } else if (satisfactionScore.score < 60) {
      actions.push({
        priority: 'Média',
        action: 'Agendar visita ou reunião',
        reason: 'Oportunidade de melhorar relacionamento',
      });
    } else if (satisfactionScore.score >= 80) {
      actions.push({
        priority: 'Baixa',
        action: 'Enviar agradecimento e oferta exclusiva',
        reason: 'Cliente premium merece atenção especial',
      });
    }

    return actions;
  }
}

export const clientRatingService = new ClientRatingService();
