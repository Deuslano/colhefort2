import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, updatePassword } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { createContext, useEffect, useRef, useState } from 'react';
import { auth, db } from '../config/firebaseConfig';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [consortiums, setConsortiums] = useState([]);
  const [draws, setDraws] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [machines, setMachines] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [prizeDeliveries, setPrizeDeliveries] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accountsReceivable, setAccountsReceivable] = useState([]);
  const [cashFlowTransactions, setCashFlowTransactions] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);

  // Rascunhos de carrinho para não perder dados ao navegar (estado local, não vai pra nuvem até finalizar)
  const [draftSaleItems, setDraftSaleItems] = useState([]);
  const [draftPurchaseItems, setDraftPurchaseItems] = useState([]);
  const [draftFulfillItems, setDraftFulfillItems] = useState([]);

  const [isLoaded, setIsLoaded] = useState(false);

  const handleSnapshotError = (collectionName, error) => {
    console.error(`Firestore snapshot error (${collectionName}):`, error);
    // If permission denied, load local fallback data so the app can function in dev.
    if (!useRefLoaded.current && (error && (error.code === 'permission-denied' || String(error).includes('Missing or insufficient permissions')))) {
      useRefLoaded.current = true;
      console.warn('Permissions denied for Firestore; loading local AsyncStorage fallback.');
      loadLocalFallback();
    }
  };

  // Ref to avoid loading fallback repeatedly
  const useRefLoaded = useRef(false);

  const loadLocalFallback = async () => {
    try {
      const keys = ['@products','@sales','@purchases','@consortiums','@draws','@invoices','@clients','@machines','@allocations','@suppliers','@categories','@units','@prizeDeliveries','@appUsers','@expenses','@accountsReceivable','@cashFlowTransactions','@serviceOrders'];
      const pairs = await AsyncStorage.multiGet(keys);
      for (const [key, value] of pairs) {
        if (!value) continue;
        const parsed = JSON.parse(value);
        switch (key) {
          case '@products': setProducts(parsed); break;
          case '@sales': setSales(parsed); break;
          case '@purchases': setPurchases(parsed); break;
          case '@consortiums': setConsortiums(parsed); break;
          case '@draws': setDraws(parsed); break;
          case '@invoices': setInvoices(parsed); break;
          case '@clients': setClients(parsed); break;
          case '@machines': setMachines(parsed); break;
          case '@allocations': setAllocations(parsed); break;
          case '@suppliers': setSuppliers(parsed); break;
          case '@categories': setCategories(parsed); break;
          case '@units': setUnits(parsed); break;
          case '@prizeDeliveries': setPrizeDeliveries(parsed); break;
          case '@appUsers': if (parsed.length>0) setAppUsers(parsed); break;
          case '@expenses': setExpenses(parsed); break;
          case '@accountsReceivable': setAccountsReceivable(parsed); break;
          case '@cashFlowTransactions': setCashFlowTransactions(parsed); break;
          case '@serviceOrders': setServiceOrders(parsed); break;
          default: break;
        }
      }
      setIsLoaded(true);
      console.log('Local fallback data loaded from AsyncStorage');
    } catch (e) {
      console.error('Failed to load local fallback data', e);
    }
  };

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'producer');
            setIsFirstLogin(userDoc.data().isFirstLogin || false);
          } else {
            // If user doc doesn't exist, check if it's the admin email
            if (user.email === 'colhefort@gmail.com') {
              setUserRole('admin');
              setIsFirstLogin(false);
              // Create the user doc
              await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                role: 'admin',
                name: 'Administrador',
                isFirstLogin: false,
                createdAt: new Date().toISOString(),
              });
            } else {
              setUserRole('producer');
              setIsFirstLogin(false);
            }
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('producer');
          setIsFirstLogin(false);
        }
      } else {
        setUserRole(null);
        setIsFirstLogin(false);
      }
      setIsAuthLoaded(true);
    });

    return () => unsubscribeAuth();
  }, []);

  // Get user display name from Firebase Auth
  const currentUserDisplayName = currentUser?.displayName || currentUser?.email?.split?.('@')?.[0] || 'usuário';

  // Load dark mode preference
  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const savedDarkMode = await AsyncStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
          setIsDarkMode(JSON.parse(savedDarkMode));
        }
      } catch (error) {
        console.error('Error loading dark mode preference:', error);
      }
    };
    loadDarkMode();
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(newMode));
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  };

  // Sincronizar com Firestore
  useEffect(() => {
    if (!currentUser) return;

    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('products', error)
    );
    const unsubSales = onSnapshot(
      query(collection(db, 'sales'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setSales(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('sales', error)
    );
    const unsubPurchases = onSnapshot(
      query(collection(db, 'purchases'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setPurchases(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('purchases', error)
    );
    const unsubBonuses = onSnapshot(
      query(collection(db, 'bonuses'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setBonuses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('bonuses', error)
    );
    const unsubConsortiums = onSnapshot(
      query(collection(db, 'consortiums'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setConsortiums(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('consortiums', error)
    );
    const unsubDraws = onSnapshot(
      query(collection(db, 'draws'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setDraws(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('draws', error)
    );
    const unsubInvoices = onSnapshot(
      query(collection(db, 'invoices'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('invoices', error)
    );
    const unsubClients = onSnapshot(
      userRole === 'admin' || userRole === 'manager' 
        ? collection(db, 'clients')
        : query(collection(db, 'clients'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('clients', error)
    );
    const unsubMachines = onSnapshot(
      query(collection(db, 'machines'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setMachines(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('machines', error)
    );
    const unsubAllocations = onSnapshot(
      query(collection(db, 'allocations'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setAllocations(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('allocations', error)
    );
    const unsubSuppliers = onSnapshot(
      query(collection(db, 'suppliers'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setSuppliers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('suppliers', error)
    );
    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        setCategories(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('categories', error)
    );
    const unsubUnits = onSnapshot(
      collection(db, 'units'),
      (snapshot) => {
        setUnits(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('units', error)
    );
    const unsubPrizeDeliveries = onSnapshot(
      collection(db, 'prizeDeliveries'),
      (snapshot) => {
        setPrizeDeliveries(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('prizeDeliveries', error)
    );
    const unsubUsers = onSnapshot(
      collection(db, 'appUsers'),
      async (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      if (usersList.length > 0) {
        setAppUsers(usersList);
      } else {
        // Se a coleção de usuários estiver vazia no Firebase, vamos tentar migrar os dados locais!
        try {
          const localUsers = await AsyncStorage.getItem('@appUsers');
          if (localUsers) {
            console.log('Migrando dados locais para o Firebase...');
            const pUsers = JSON.parse(localUsers);
            for (let u of pUsers) await addDoc(collection(db, 'appUsers'), u);

            const mSales = await AsyncStorage.getItem('@sales');
            if (mSales) JSON.parse(mSales).forEach(item => addDoc(collection(db, 'sales'), item));

            const mPurchases = await AsyncStorage.getItem('@purchases');
            if (mPurchases) JSON.parse(mPurchases).forEach(item => addDoc(collection(db, 'purchases'), item));

            const mConsortiums = await AsyncStorage.getItem('@consortiums');
            if (mConsortiums) JSON.parse(mConsortiums).forEach(item => addDoc(collection(db, 'consortiums'), item));

            const mDraws = await AsyncStorage.getItem('@draws');
            if (mDraws) JSON.parse(mDraws).forEach(item => addDoc(collection(db, 'draws'), item));

            const mInvoices = await AsyncStorage.getItem('@invoices');
            if (mInvoices) JSON.parse(mInvoices).forEach(item => addDoc(collection(db, 'invoices'), item));

            const mClients = await AsyncStorage.getItem('@clients');
            if (mClients) JSON.parse(mClients).forEach(item => addDoc(collection(db, 'clients'), item));

            const mPrize = await AsyncStorage.getItem('@prizeDeliveries');
            if (mPrize) JSON.parse(mPrize).forEach(item => addDoc(collection(db, 'prizeDeliveries'), item));

            // Para os produtos, se houver local products... wait, products were hardcoded initially.
            // If they didn't have products saved, we can just insert default ones
            const defaultProducts = [
              { name: 'Creme Mãos Karité', code: '10101', cost: 40.0, price: 79.9, stock: 20 },
              { name: 'Shampoo Verbena', code: '10202', cost: 25.0, price: 49.9, stock: 15 },
              { name: 'Sabonete Líquido Lavanda', code: '10303', cost: 18.0, price: 35.9, stock: 8 }
            ];
            for (let p of defaultProducts) await addDoc(collection(db, 'products'), p);
            
            console.log('Migração concluída!');
            // Apaga para não migrar de novo
            await AsyncStorage.removeItem('@appUsers');
          }
        } catch(e) {
          console.error("Erro na migração", e);
        }
      }
    },
    (error) => handleSnapshotError('appUsers', error)
    );
    const unsubExpenses = onSnapshot(
      query(collection(db, 'expenses'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('expenses', error)
    );
    const unsubAccountsReceivable = onSnapshot(
      query(collection(db, 'accountsReceivable'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setAccountsReceivable(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('accountsReceivable', error)
    );
    const unsubCashFlowTransactions = onSnapshot(
      query(collection(db, 'cashFlowTransactions'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setCashFlowTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('cashFlowTransactions', error)
    );
    const unsubServiceOrders = onSnapshot(
      query(collection(db, 'serviceOrders'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        setServiceOrders(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleSnapshotError('serviceOrders', error)
    );

    setIsLoaded(true);

    return () => {
      unsubProducts(); unsubSales(); unsubPurchases(); unsubBonuses();
      unsubConsortiums(); unsubDraws(); unsubInvoices(); unsubClients();
      unsubMachines(); unsubAllocations(); unsubSuppliers(); unsubCategories(); unsubUnits();
      unsubPrizeDeliveries(); unsubUsers(); unsubExpenses(); unsubAccountsReceivable();
      unsubCashFlowTransactions(); unsubServiceOrders();
    };
  }, [currentUser]);

  const addSale = async (sale) => {
    const saleRef = await addDoc(collection(db, 'sales'), { ...sale, userId: currentUser.uid });
    
    // Atualiza o estoque dos produtos e verifica estoque baixo
    for (const item of sale.items) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        const newStock = product.stock - item.quantity;
        await updateDoc(doc(db, 'products', product.id), { stock: newStock });
        
        // Check for low stock alert (threshold: 5 units)
        if (newStock <= 5) {
          console.warn(`ALERTA: Estoque baixo para ${product.name}. Restante: ${newStock}`);
        }
      }
    }

    // Automatically create accounts receivable entry
    // If payment is installment-based, create separate entries for each installment
    if (sale.paymentType === 'prazo' && sale.installments && sale.installments > 1) {
      const installmentValue = sale.total / sale.installments;
      const now = new Date();
      
      if (sale.fixedPaymentDay && parseInt(sale.fixedPaymentDay) > 0 && parseInt(sale.fixedPaymentDay) <= 31) {
        const paymentDay = parseInt(sale.fixedPaymentDay);
        
        for (let i = 1; i <= sale.installments; i++) {
          const dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
          dueDate.setDate(Math.min(paymentDay, new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate()));
          
          const formattedDate = `${String(dueDate.getDate()).padStart(2, '0')}/${String(dueDate.getMonth() + 1).padStart(2, '0')}/${dueDate.getFullYear()}`;
          
          await addDoc(collection(db, 'accountsReceivable'), {
            saleId: saleRef.id,
            clientName: sale.clientName,
            clientId: sale.clientId,
            amount: installmentValue,
            date: formattedDate,
            dueDate: dueDate.toISOString(),
            status: 'Pendente',
            description: `Parc. ${i}/${sale.installments} - Venda #${saleRef.id}`,
            installmentNumber: i,
            totalInstallments: sale.installments,
            createdAt: new Date().toISOString(),
            userId: currentUser.uid,
          });
        }
      } else {
        for (let i = 1; i <= sale.installments; i++) {
          const dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
          
          const formattedDate = `${String(dueDate.getDate()).padStart(2, '0')}/${String(dueDate.getMonth() + 1).padStart(2, '0')}/${dueDate.getFullYear()}`;
          
          await addDoc(collection(db, 'accountsReceivable'), {
            saleId: saleRef.id,
            clientName: sale.clientName,
            clientId: sale.clientId,
            amount: installmentValue,
            date: formattedDate,
            dueDate: dueDate.toISOString(),
            status: 'Pendente',
            description: `Parc. ${i}/${sale.installments} - Venda #${saleRef.id}`,
            installmentNumber: i,
            totalInstallments: sale.installments,
            createdAt: new Date().toISOString(),
            userId: currentUser.uid,
          });
        }
      }
    } else {
      // Single payment - create one accounts receivable entry
      await addDoc(collection(db, 'accountsReceivable'), {
        saleId: saleRef.id,
        clientName: sale.clientName,
        clientId: sale.clientId,
        amount: sale.total,
        dueDate: sale.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days
        status: 'Pendente',
        description: `Venda #${saleRef.id} - ${sale.items.map(i => i.name).join(', ')}`,
        createdAt: new Date().toISOString(),
        userId: currentUser.uid,
      });
    }

    // Automatically create cash flow transaction (income)
    await addDoc(collection(db, 'cashFlowTransactions'), {
      saleId: saleRef.id,
      type: 'Entrada',
      category: 'Venda',
      amount: sale.total,
      date: sale.date || new Date().toISOString(),
      description: `Venda para ${sale.clientName}`,
      status: sale.paymentMethod === 'Dinheiro' ? 'Confirmado' : 'Pendente',
      createdAt: new Date().toISOString(),
      userId: currentUser.uid,
    });
  };

  const addPurchase = async (purchase) => {
    const purchaseRef = await addDoc(collection(db, 'purchases'), { ...purchase, userId: currentUser.uid });
    for (const item of purchase.items) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        await updateDoc(doc(db, 'products', product.id), { stock: product.stock + item.quantity });
      }
    }

    // Automatically create cash flow transaction (expense)
    await addDoc(collection(db, 'cashFlowTransactions'), {
      purchaseId: purchaseRef.id,
      type: 'Saída',
      category: 'Compra',
      amount: purchase.total,
      date: purchase.date || new Date().toISOString(),
      description: `Compra de ${purchase.items.map(i => i.name).join(', ')}`,
      status: purchase.paymentMethod === 'Dinheiro' ? 'Confirmado' : 'Pendente',
      createdAt: new Date().toISOString(),
      userId: currentUser.uid,
    });
  };

  const addBonus = async (bonus) => {
    await addDoc(collection(db, 'bonuses'), { ...bonus, userId: currentUser.uid });
    for (const item of bonus.items) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        await updateDoc(doc(db, 'products', product.id), { stock: product.stock + item.quantity });
      }
    }
  };

  const updateSale = async (updatedSale) => {
    await updateDoc(doc(db, 'sales', updatedSale.id), updatedSale);
  };

  const updatePurchase = async (updatedPurchase) => {
    await updateDoc(doc(db, 'purchases', updatedPurchase.id), updatedPurchase);
  };

  const addPrizeDelivery = async (delivery) => {
    await addDoc(collection(db, 'prizeDeliveries'), { ...delivery, userId: currentUser.uid });
    for (const item of delivery.items) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        await updateDoc(doc(db, 'products', product.id), { stock: product.stock - item.quantity });
      }
    }
  };

  const addProduct = async (product) => {
    await addDoc(collection(db, 'products'), { ...product, userId: currentUser.uid });
  };

  const updateProduct = async (updatedProduct) => {
    await updateDoc(doc(db, 'products', updatedProduct.id), updatedProduct);
  };

  const deleteProduct = async (productId) => {
    await deleteDoc(doc(db, 'products', productId));
  };

  const addConsortium = async (consortium) => {
    await addDoc(collection(db, 'consortiums'), { ...consortium, userId: currentUser.uid });
  };

  const updateConsortium = async (updatedConsortium) => {
    await updateDoc(doc(db, 'consortiums', updatedConsortium.id), updatedConsortium);
  };

  const deleteConsortium = async (consortiumId) => {
    await deleteDoc(doc(db, 'consortiums', consortiumId));
  };

  const addDraw = async (draw) => {
    await addDoc(collection(db, 'draws'), { ...draw, userId: currentUser.uid });
  };

  const addInvoice = async (invoice) => {
    await addDoc(collection(db, 'invoices'), { ...invoice, userId: currentUser.uid });
  };

  const updateInvoice = async (updatedInvoice) => {
    await updateDoc(doc(db, 'invoices', updatedInvoice.id), updatedInvoice);
  };

  const addClient = async (client) => {
    // Se o cliente tiver e-mail, criar usuário no Firebase Auth com senha temporária
    if (client.email) {
      try {
        const tempPassword = 'Temp123456'; // Senha temporária
        const userCredential = await createUserWithEmailAndPassword(auth, client.email, tempPassword);
        
        // Criar documento de usuário com flag de primeiro acesso
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: client.email,
          role: 'producer',
          name: client.name,
          cpf: client.cpf || '',
          farm: client.farm || '',
          address: client.address || '',
          cep: client.cep || '',
          phone: client.phone || '',
          isFirstLogin: true, // Flag para indicar primeiro acesso
          createdAt: new Date().toISOString(),
        });

        // Atualizar o client data com o userId do novo usuário
        client.userId = userCredential.user.uid;
        client.hasAccount = true;
      } catch (error) {
        console.error('Erro ao criar usuário para cliente:', error);
        // Se o usuário já existir, apenas continuar com o cadastro do cliente
        if (error.code !== 'auth/email-already-in-use') {
          throw error;
        }
      }
    }
    
    await addDoc(collection(db, 'clients'), { ...client, userId: currentUser.uid });
  };

  const updateClient = async (updatedClient) => {
    await updateDoc(doc(db, 'clients', updatedClient.id), updatedClient);
  };

  const addAllocation = async (allocation) => {
    // Create the allocation
    const allocationRef = await addDoc(collection(db, 'allocations'), { 
      ...allocation, 
      userId: currentUser.uid,
    });
    
    // Automatically create a service order for this allocation
    await addDoc(collection(db, 'serviceOrders'), {
      allocationId: allocationRef.id,
      machineId: allocation.machineId,
      machineName: allocation.machineName,
      clientId: allocation.clientId,
      clientName: allocation.clientName,
      operator: allocation.operator,
      serviceType: allocation.serviceType,
      rentalValue: allocation.rentalValue,
      paymentMethod: allocation.paymentMethod,
      installments: allocation.installments,
      paymentDates: allocation.paymentDates,
      startDate: allocation.startDate,
      endDate: allocation.endDate,
      actualStartDate: allocation.actualStartDate || '',
      actualEndDate: allocation.actualEndDate || '',
      status: allocation.status || 'Pendentes',
      description: `Alocação de máquina ${allocation.machineName} para ${allocation.clientName} - ${allocation.serviceType}`,
      observations: allocation.observations || '',
      createdAt: new Date().toISOString(),
      userId: currentUser.uid,
    });

    // Create accounts receivable for installments if payment method is Parcelado
    if (allocation.paymentMethod === 'Parcelado' && allocation.installments && allocation.paymentDay) {
      const installmentAmount = allocation.rentalValue / parseInt(allocation.installments);
      const [startDay, startMonth, startYear] = allocation.startDate.split('/').map(Number);
      
      for (let i = 0; i < parseInt(allocation.installments); i++) {
        const month = (startMonth + i) % 12 || 12;
        const year = startYear + Math.floor((startMonth + i - 1) / 12);
        const dueDate = `${String(allocation.paymentDay).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        
        await addDoc(collection(db, 'accountsReceivable'), {
          allocationId: allocationRef.id,
          clientId: allocation.clientId,
          clientName: allocation.clientName,
          description: `${allocation.serviceType} - Parcela ${i + 1}/${allocation.installments}`,
          amount: installmentAmount,
          dueDate: dueDate,
          status: 'Pendente',
          installmentNumber: i + 1,
          totalInstallments: parseInt(allocation.installments),
          createdAt: new Date().toISOString(),
          userId: currentUser.uid,
        });
      }
    } else if (allocation.paymentMethod === 'À vista') {
      // Create single account receivable for à vista
      await addDoc(collection(db, 'accountsReceivable'), {
        allocationId: allocationRef.id,
        clientId: allocation.clientId,
        clientName: allocation.clientName,
        description: allocation.serviceType,
        amount: allocation.rentalValue,
        dueDate: allocation.startDate,
        status: 'Pendente',
        installmentNumber: 1,
        totalInstallments: 1,
        createdAt: new Date().toISOString(),
        userId: currentUser.uid,
      });
    }

    // Don't automatically create cash flow transaction for allocation
    // Cash flow should only be created when payment is actually received

    // Automatically create accounts receivable entry for allocation
    await addDoc(collection(db, 'accountsReceivable'), {
      allocationId: allocationRef.id,
      clientName: allocation.clientName,
      clientId: allocation.clientId,
      amount: allocation.totalValue || allocation.rentalValue,
      date: allocation.startDate || new Date().toISOString(),
      dueDate: allocation.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Pendente',
      description: `Alocação de ${allocation.machineName} - ${allocation.startDate} a ${allocation.endDate}`,
      createdAt: new Date().toISOString(),
      userId: currentUser.uid,
    });
  };

  const updateAllocation = async (updatedAllocation) => {
    await updateDoc(doc(db, 'allocations', updatedAllocation.id), updatedAllocation);
  };

  const deleteAllocation = async (allocationId) => {
    try {
      const allocation = allocations.find(a => a.id === allocationId);
      if (allocation && allocation.machineId) {
        const machine = machines.find(m => m.id === allocation.machineId);
        if (machine) {
          await updateDoc(doc(db, 'machines', machine.id), { 
            status: 'Disponível',
            clientId: '',
            clientName: ''
          });
        }
      }
      
      await deleteDoc(doc(db, 'allocations', allocationId));
    } catch (error) {
      console.error('Erro ao excluir alocação:', error);
      throw error;
    }
  };

  const addMachine = async (machine) => {
    await addDoc(collection(db, 'machines'), { ...machine, userId: currentUser.uid });
  };

  const updateMachine = async (updatedMachine) => {
    await updateDoc(doc(db, 'machines', updatedMachine.id), updatedMachine);
  };

  const deleteMachine = async (machineId) => {
    await deleteDoc(doc(db, 'machines', machineId));
  };

  const addSupplier = async (supplier) => {
    await addDoc(collection(db, 'suppliers'), { ...supplier, userId: currentUser.uid });
  };

  const updateSupplier = async (updatedSupplier) => {
    await updateDoc(doc(db, 'suppliers', updatedSupplier.id), updatedSupplier);
  };

  const deleteSupplier = async (supplierId) => {
    await deleteDoc(doc(db, 'suppliers', supplierId));
  };

  const addCategory = async (category) => {
    await addDoc(collection(db, 'categories'), { ...category, userId: currentUser.uid });
  };

  const updateCategory = async (updatedCategory) => {
    await updateDoc(doc(db, 'categories', updatedCategory.id), updatedCategory);
  };

  const deleteCategory = async (categoryId) => {
    await deleteDoc(doc(db, 'categories', categoryId));
  };

  const addUnit = async (unit) => {
    await addDoc(collection(db, 'units'), { ...unit, userId: currentUser.uid });
  };

  const updateUnit = async (updatedUnit) => {
    await updateDoc(doc(db, 'units', updatedUnit.id), updatedUnit);
  };

  const deleteUnit = async (unitId) => {
    await deleteDoc(doc(db, 'units', unitId));
  };

  // Expenses CRUD
  const addExpense = async (expense) => {
    const expenseRef = await addDoc(collection(db, 'expenses'), { ...expense, userId: currentUser.uid });

    // Create individual expense records for installments if payment method is Parcelado
    if (expense.paymentMethod === 'Parcelado' && expense.installments && expense.paymentDay) {
      const installmentAmount = expense.amount / parseInt(expense.installments);
      const [startDay, startMonth, startYear] = expense.date.split('/').map(Number);
      
      for (let i = 0; i < parseInt(expense.installments); i++) {
        const month = (startMonth + i) % 12 || 12;
        const year = startYear + Math.floor((startMonth + i - 1) / 12);
        const dueDate = `${String(expense.paymentDay).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        
        await addDoc(collection(db, 'expenses'), {
          parentExpenseId: expenseRef.id,
          description: `${expense.description} - Parcela ${i + 1}/${expense.installments}`,
          amount: installmentAmount,
          date: dueDate,
          status: 'Pendente',
          installmentNumber: i + 1,
          totalInstallments: parseInt(expense.installments),
          paymentMethod: 'Parcelado',
          createdAt: new Date().toISOString(),
          userId: currentUser.uid,
        });
      }
      
      // Update parent expense to show it's split
      await updateDoc(expenseRef, {
        isSplit: true,
        splitInto: parseInt(expense.installments),
      });
    }

    // Automatically create cash flow transaction (expense)
    await addDoc(collection(db, 'cashFlowTransactions'), {
      expenseId: expenseRef.id,
      type: 'Saída',
      category: expense.category || 'Despesa',
      amount: expense.amount,
      date: expense.date || new Date().toISOString(),
      description: expense.description || expense.category,
      status: expense.status || 'Pendente',
      createdAt: new Date().toISOString(),
      userId: currentUser.uid,
    });
  };

  const updateExpense = async (updatedExpense) => {
    await updateDoc(doc(db, 'expenses', updatedExpense.id), updatedExpense);
    
    // Update corresponding cash flow transaction
    if (updatedExpense.status === 'Pago') {
      const cashFlowQuery = query(
        collection(db, 'cashFlowTransactions'),
        where('expenseId', '==', updatedExpense.id)
      );
      const snapshot = await getDocs(cashFlowQuery);
      snapshot.forEach((doc) => {
        updateDoc(doc.ref, { 
          status: 'Confirmado',
          paymentDate: updatedExpense.paymentDate || new Date().toISOString()
        });
      });
    }
  };

  const deleteExpense = async (expenseId) => {
    await deleteDoc(doc(db, 'expenses', expenseId));
  };

  // Accounts Receivable CRUD
  const addAccountReceivable = async (account) => {
    await addDoc(collection(db, 'accountsReceivable'), { ...account, userId: currentUser.uid });
  };

  const updateAccountReceivable = async (updatedAccount) => {
    await updateDoc(doc(db, 'accountsReceivable', updatedAccount.id), updatedAccount);
    
    // Create cash flow transaction when account is received
    if (updatedAccount.status === 'Recebido') {
      await addDoc(collection(db, 'cashFlowTransactions'), {
        accountId: updatedAccount.id,
        allocationId: updatedAccount.allocationId,
        type: 'Entrada',
        category: 'Conta a Receber',
        amount: updatedAccount.amount,
        date: updatedAccount.paymentDate || new Date().toISOString(),
        description: updatedAccount.description || 'Recebimento de conta',
        status: 'Confirmado',
        createdAt: new Date().toISOString(),
        userId: currentUser.uid,
      });
    }
  };

  const deleteAccountReceivable = async (accountId) => {
    await deleteDoc(doc(db, 'accountsReceivable', accountId));
  };

  // Cash Flow Transactions CRUD
  const addCashFlowTransaction = async (transaction) => {
    await addDoc(collection(db, 'cashFlowTransactions'), { ...transaction, userId: currentUser.uid });
  };

  const updateCashFlowTransaction = async (updatedTransaction) => {
    await updateDoc(doc(db, 'cashFlowTransactions', updatedTransaction.id), updatedTransaction);
  };

  const deleteCashFlowTransaction = async (transactionId) => {
    await deleteDoc(doc(db, 'cashFlowTransactions', transactionId));
  };

  // Service Orders CRUD
  const addServiceOrder = async (order) => {
    await addDoc(collection(db, 'serviceOrders'), { ...order, userId: currentUser.uid });
  };

  const updateServiceOrder = async (updatedOrder) => {
    await updateDoc(doc(db, 'serviceOrders', updatedOrder.id), updatedOrder);
  };

  const deleteServiceOrder = async (orderId) => {
    await deleteDoc(doc(db, 'serviceOrders', orderId));
  };

  // Check for inactive clients (no allocations in last 30 days)
  useEffect(() => {
    if (!currentUser || clients.length === 0 || allocations.length === 0) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveClients = clients.filter(client => {
      const clientAllocations = allocations.filter(a => a.clientId === client.id);
      const hasRecentAllocation = clientAllocations.some(a => 
        new Date(a.startDate) >= thirtyDaysAgo || new Date(a.endDate) >= thirtyDaysAgo
      );
      return !hasRecentAllocation && clientAllocations.length > 0; // Only clients with past allocations
    });

    if (inactiveClients.length > 0) {
      console.warn('ALERTA: Clientes inativos detectados:', inactiveClients.map(c => c.name).join(', '));
    }
  }, [clients, allocations, currentUser]);

  // Generate automatic monthly report
  const generateMonthlyReport = async () => {
    if (!currentUser) return;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlySales = sales.filter(s => new Date(s.date) >= firstDayOfMonth && new Date(s.date) <= lastDayOfMonth);
    const monthlyPurchases = purchases.filter(p => new Date(p.date) >= firstDayOfMonth && new Date(p.date) <= lastDayOfMonth);
    const monthlyExpenses = expenses.filter(e => new Date(e.date) >= firstDayOfMonth && new Date(e.date) <= lastDayOfMonth);

    const totalSales = monthlySales.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalPurchases = monthlyPurchases.reduce((sum, p) => sum + (p.total || 0), 0);
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const profit = totalSales - totalPurchases - totalExpenses;

    const report = {
      month: now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
      totalSales,
      totalPurchases,
      totalExpenses,
      profit,
      salesCount: monthlySales.length,
      purchasesCount: monthlyPurchases.length,
      expensesCount: monthlyExpenses.length,
      generatedAt: new Date().toISOString(),
      userId: currentUser.uid,
    };

    console.log('RELATÓRIO MENSAL GERADO:', report);
    return report;
  };

  // Firebase Auth Functions
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if this is the main admin
      if (email === 'colhefort@gmail.com') {
        // Ensure admin role is set in Firestore
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email,
            role: 'admin',
            name: 'Administrador',
            createdAt: new Date().toISOString(),
          }, { merge: true });
          // Force reload user role
          setUserRole('admin');
        }
      }
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const registerUser = async (email, password, role = 'producer', name = '', additionalData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update user profile with display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user document in Firestore with role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        role,
        name,
        createdAt: new Date().toISOString(),
        ...additionalData,
      });

      // If registering as producer, create client/farm record automatically
      if (role === 'producer' && additionalData) {
        await addDoc(collection(db, 'clients'), {
          userId: userCredential.user.uid,
          name: name,
          email: email,
          cpf: additionalData.cpf || '',
          farm: additionalData.farmName || '',
          phone: '',
          address: additionalData.farmAddress || '',
          cep: additionalData.cep || '',
          createdAt: new Date().toISOString(),
        });
      }

      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Legacy auth for backward compatibility
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  const legacyLogin = (email, password) => {
    const user = appUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setIsAuthenticated(true);
      setCurrentUserEmail(email);
      return true;
    }
    return false;
  };

  const legacyRegisterUser = async (email, password) => {
    const exists = appUsers.find(u => u.email === email);
    if (exists) return false;
    await addDoc(collection(db, 'appUsers'), { email, password });
    return true;
  };

  const legacyLogout = () => {
    setIsAuthenticated(false);
    setCurrentUserEmail(null);
  };

  return (
    <AppContext.Provider value={{
      // Firebase Auth
      currentUser, userRole, isAuthLoaded, isFirstLogin, login, logout, registerUser, currentUserDisplayName,
      // Dark Mode
      isDarkMode, toggleDarkMode,
      // Legacy Auth (for backward compatibility)
      isAuthenticated, legacyLogin, legacyLogout, currentUserEmail, legacyRegisterUser,
      // Data
      products, setProducts, addProduct, updateProduct, deleteProduct,
      sales, purchases, bonuses, consortiums, draws, invoices, clients, machines, allocations, suppliers, categories, units, prizeDeliveries,
      addSale, addPurchase, addBonus, addConsortium, updateConsortium, deleteConsortium,
      addDraw, addInvoice, updateInvoice, updateSale, updatePurchase, addClient, updateClient,
      addAllocation, updateAllocation, deleteAllocation,
      addMachine, updateMachine, deleteMachine,
      addSupplier, updateSupplier, deleteSupplier,
      addCategory, updateCategory, deleteCategory,
      addUnit, updateUnit, deleteUnit,
      addPrizeDelivery,
      expenses, addExpense, updateExpense, deleteExpense,
      accountsReceivable, addAccountReceivable, updateAccountReceivable, deleteAccountReceivable,
      cashFlowTransactions, addCashFlowTransaction, updateCashFlowTransaction, deleteCashFlowTransaction,
      serviceOrders, addServiceOrder, updateServiceOrder, deleteServiceOrder,
      draftSaleItems, setDraftSaleItems,
      draftPurchaseItems, setDraftPurchaseItems,
      draftFulfillItems, setDraftFulfillItems,
      // Reports
      generateMonthlyReport,
    }}>
      {children}
    </AppContext.Provider>
  );
};
