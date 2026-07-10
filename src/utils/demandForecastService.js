// Demand Forecasting Service

class DemandForecastService {
  // Predict product demand based on historical sales
  predictProductDemand(sales, productId, forecastDays = 30) {
    const productSales = sales.filter(s => 
      s.items.some(item => item.id === productId)
    );

    if (productSales.length === 0) {
      return {
        predictedDemand: 0,
        confidence: 0,
        recommendation: 'Sem dados históricos',
      };
    }

    // Calculate average daily sales
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentSales = productSales.filter(s => new Date(s.date) >= thirtyDaysAgo);
    const totalQuantitySold = recentSales.reduce((sum, sale) => {
      const item = sale.items.find(i => i.id === productId);
      return sum + (item ? item.quantity : 0);
    }, 0);

    const averageDailySales = totalQuantitySold / 30;
    const predictedDemand = Math.round(averageDailySales * forecastDays);

    // Calculate confidence based on data consistency
    const confidence = Math.min(100, (recentSales.length / 10) * 100);

    // Generate recommendation
    let recommendation = 'Manter estoque atual';
    if (predictedDemand > 50) {
      recommendation = 'Considerar aumento de estoque';
    } else if (predictedDemand < 10) {
      recommendation = 'Estoque suficiente, considerar redução';
    }

    return {
      predictedDemand,
      averageDailySales: Math.round(averageDailySales * 100) / 100,
      confidence: Math.round(confidence),
      recommendation,
      forecastDays,
    };
  }

  // Predict machine utilization
  predictMachineUtilization(allocations, machineId, forecastDays = 30) {
    const machineAllocations = allocations.filter(a => a.machineId === machineId);

    if (machineAllocations.length === 0) {
      return {
        predictedUtilization: 0,
        confidence: 0,
        recommendation: 'Sem dados históricos',
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentAllocations = machineAllocations.filter(a => new Date(a.startDate) >= thirtyDaysAgo);
    
    // Calculate total days allocated
    const totalDaysAllocated = recentAllocations.reduce((sum, allocation) => {
      const start = new Date(allocation.startDate);
      const end = new Date(allocation.endDate);
      return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }, 0);

    const averageDailyUtilization = totalDaysAllocated / 30;
    const predictedUtilization = Math.round((averageDailyUtilization / forecastDays) * 100);

    // Calculate confidence
    const confidence = Math.min(100, (recentAllocations.length / 5) * 100);

    // Generate recommendation
    let recommendation = 'Utilização normal';
    if (predictedUtilization > 80) {
      recommendation = 'Alta utilização, considerar adicionar máquina';
    } else if (predictedUtilization < 30) {
      recommendation = 'Baixa utilização, considerar realocação';
    }

    return {
      predictedUtilization,
      averageDailyUtilization: Math.round(averageDailyUtilization * 100) / 100,
      confidence: Math.round(confidence),
      recommendation,
      forecastDays,
    };
  }

  // Suggest minimum stock levels
  suggestMinimumStock(sales, products) {
    const suggestions = {};

    products.forEach(product => {
      const forecast = this.predictProductDemand(sales, product.id, 30);
      
      // Safety stock: 20% above predicted demand
      const safetyStock = Math.round(forecast.predictedDemand * 1.2);
      const minimumStock = Math.max(safetyStock, 5); // Minimum 5 units

      suggestions[product.id] = {
        productName: product.name,
        currentStock: product.stock,
        predictedDemand: forecast.predictedDemand,
        suggestedMinimum: minimumStock,
        needsRestock: product.stock < minimumStock,
        urgency: this.calculateUrgency(product.stock, minimumStock),
      };
    });

    return suggestions;
  }

  // Calculate urgency for restocking
  calculateUrgency(currentStock, minimumStock) {
    if (currentStock === 0) return 'Crítica';
    if (currentStock < minimumStock * 0.3) return 'Alta';
    if (currentStock < minimumStock * 0.6) return 'Média';
    return 'Baixa';
  }

  // Predict seasonal trends
  analyzeSeasonalTrends(sales, months = 12) {
    const monthlyData = {};
    
    sales.forEach(sale => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, total: 0 };
      }
      
      monthlyData[monthKey].count++;
      monthlyData[monthKey].total += sale.total || 0;
    });

    // Convert to array and sort by date
    const trendData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        count: data.count,
        total: data.total,
        average: data.count > 0 ? data.total / data.count : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-months);

    // Calculate growth rate
    if (trendData.length >= 2) {
      const firstMonth = trendData[0];
      const lastMonth = trendData[trendData.length - 1];
      const growthRate = firstMonth.total > 0 
        ? ((lastMonth.total - firstMonth.total) / firstMonth.total) * 100 
        : 0;

      return {
        trendData,
        growthRate: Math.round(growthRate * 100) / 100,
        trend: growthRate > 0 ? 'Crescente' : growthRate < 0 ? 'Decrescente' : 'Estável',
      };
    }

    return {
      trendData,
      growthRate: 0,
      trend: 'Insuficiente dados',
    };
  }

  // Generate comprehensive demand report
  generateDemandReport(sales, allocations, products, machines) {
    const productForecasts = products.map(product => ({
      ...this.predictProductDemand(sales, product.id),
      productName: product.name,
      currentStock: product.stock,
    }));

    const machineForecasts = machines.map(machine => ({
      ...this.predictMachineUtilization(allocations, machine.id),
      machineName: machine.name,
    }));

    const stockSuggestions = this.suggestMinimumStock(sales, products);
    const seasonalTrends = this.analyzeSeasonalTrends(sales);

    return {
      productForecasts,
      machineForecasts,
      stockSuggestions,
      seasonalTrends,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const demandForecastService = new DemandForecastService();
