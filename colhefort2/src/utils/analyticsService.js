// Advanced Analytics Service for business intelligence

class AnalyticsService {
  // Sales analytics
  getSalesAnalytics(sales, period = 'month') {
    const now = new Date();
    let startDate, endDate;

    if (period === 'week') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      endDate = now;
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    const periodSales = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    const totalRevenue = periodSales.reduce((sum, s) => sum + (s.total || 0), 0);
    const averageSale = periodSales.length > 0 ? totalRevenue / periodSales.length : 0;
    
    // Sales by client
    const salesByClient = {};
    periodSales.forEach(s => {
      if (!salesByClient[s.clientName]) {
        salesByClient[s.clientName] = { count: 0, total: 0 };
      }
      salesByClient[s.clientName].count++;
      salesByClient[s.clientName].total += s.total || 0;
    });

    // Top clients
    const topClients = Object.entries(salesByClient)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalRevenue,
      averageSale,
      salesCount: periodSales.length,
      topClients,
      period,
    };
  }

  // Profitability analysis
  getProfitabilityAnalysis(sales, purchases, expenses, period = 'month') {
    const now = new Date();
    let startDate, endDate;

    if (period === 'week') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      endDate = now;
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    const periodSales = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    const periodPurchases = purchases.filter(p => {
      const purchaseDate = new Date(p.date);
      return purchaseDate >= startDate && purchaseDate <= endDate;
    });

    const periodExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const totalRevenue = periodSales.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalPurchases = periodPurchases.reduce((sum, p) => sum + (p.total || 0), 0);
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const grossProfit = totalRevenue - totalPurchases;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalPurchases,
      totalExpenses,
      grossProfit,
      netProfit,
      profitMargin,
      period,
    };
  }

  // Machine usage analytics
  getMachineUsageAnalytics(allocations, machines, period = 'month') {
    const now = new Date();
    let startDate, endDate;

    if (period === 'week') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      endDate = now;
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    const periodAllocations = allocations.filter(a => {
      const allocationDate = new Date(a.startDate);
      return allocationDate >= startDate && allocationDate <= endDate;
    });

    // Usage by machine
    const usageByMachine = {};
    periodAllocations.forEach(a => {
      if (!usageByMachine[a.machineName]) {
        usageByMachine[a.machineName] = { count: 0, totalValue: 0 };
      }
      usageByMachine[a.machineName].count++;
      usageByMachine[a.machineName].totalValue += a.totalValue || 0;
    });

    // Most used machines
    const mostUsedMachines = Object.entries(usageByMachine)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Machine utilization rate
    const machineUtilization = machines.map(machine => {
      const machineAllocations = periodAllocations.filter(a => a.machineId === machine.id);
      const totalDays = machineAllocations.reduce((sum, a) => {
        const start = new Date(a.startDate);
        const end = new Date(a.endDate);
        return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      }, 0);
      
      const periodDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const utilizationRate = periodDays > 0 ? (totalDays / periodDays) * 100 : 0;

      return {
        name: machine.name,
        totalDays,
        utilizationRate,
      };
    });

    return {
      totalAllocations: periodAllocations.length,
      mostUsedMachines,
      machineUtilization,
      period,
    };
  }

  // Month over month comparison
  getMonthOverMonthComparison(sales, purchases, expenses) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentSales = sales.filter(s => new Date(s.date) >= currentMonthStart);
    const previousSales = sales.filter(s => {
      const d = new Date(s.date);
      return d >= previousMonthStart && d <= previousMonthEnd;
    });

    const currentRevenue = currentSales.reduce((sum, s) => sum + (s.total || 0), 0);
    const previousRevenue = previousSales.reduce((sum, s) => sum + (s.total || 0), 0);

    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    return {
      currentRevenue,
      previousRevenue,
      revenueGrowth,
      currentMonth: now.toLocaleString('pt-BR', { month: 'long' }),
      previousMonth: new Date(now.getFullYear(), now.getMonth() - 1).toLocaleString('pt-BR', { month: 'long' }),
    };
  }

  // Client segmentation
  getClientSegmentation(sales, clients) {
    const clientSpending = {};
    sales.forEach(s => {
      if (!clientSpending[s.clientName]) {
        clientSpending[s.clientName] = 0;
      }
      clientSpending[s.clientName] += s.total || 0;
    });

    const segments = {
      high: [], // > R$ 10.000
      medium: [], // R$ 5.000 - R$ 10.000
      low: [], // < R$ 5.000
    };

    Object.entries(clientSpending).forEach(([clientName, total]) => {
      if (total > 10000) {
        segments.high.push({ name: clientName, total });
      } else if (total > 5000) {
        segments.medium.push({ name: clientName, total });
      } else {
        segments.low.push({ name: clientName, total });
      }
    });

    return {
      high: segments.high.sort((a, b) => b.total - a.total),
      medium: segments.medium.sort((a, b) => b.total - a.total),
      low: segments.low.sort((a, b) => b.total - a.total),
    };
  }
}

export const analyticsService = new AnalyticsService();
