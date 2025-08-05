import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Copy, Check, X, Eye, FileText, LogOut, AlertCircle } from 'lucide-react';

// ===========================================
// CONFIGURAÇÃO DO SUPABASE
// ===========================================
// SUBSTITUA PELAS SUAS CREDENCIAIS REAIS
const SUPABASE_URL = 'https://pirodqbhdfywnslpymgt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpcm9kcWJoZGZ5d25zbHB5bWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDA3ODMsImV4cCI6MjA2OTk3Njc4M30.g6nqIZFm0lZRXAgRW43w6rA42MtYmZaI-DWYFEwvKqg';

// Simulação do cliente Supabase (substitua pela lib real)
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.currentUser = null;
  }

  // Simular autenticação
  async signInWithPassword({ email, password }) {
    // Em produção, isso fará a requisição real para o Supabase
    if (email === 'admin@viagens.com' && password === '123456') {
      this.currentUser = { email, id: '1' };
      return { data: { user: this.currentUser }, error: null };
    }
    return { data: null, error: { message: 'Credenciais inválidas' } };
  }

  async signOut() {
    this.currentUser = null;
    return { error: null };
  }

  // Simular operações de banco
  from(table) {
    return new TableClient(table, this);
  }
}

class TableClient {
  constructor(table, client) {
    this.table = table;
    this.client = client;
    this.filters = [];
    this.orderBy = null;
  }

  select(columns = '*') {
    this.selectedColumns = columns;
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  order(column, options = {}) {
    this.orderBy = { column, ...options };
    return this;
  }

  async insert(data) {
    // Simular inserção
    const newRecord = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.table === 'viagens') {
      newRecord.link_publico = `https://seuapp.com/inscricao?viagem=${newRecord.id}`;
      mockData.viagens.push(newRecord);
    } else if (this.table === 'reservas') {
      mockData.reservas.push(newRecord);
    }

    return { data: [newRecord], error: null };
  }

  async update(data) {
    // Simular atualização
    let table = mockData[this.table] || [];
    
    this.filters.forEach(filter => {
      if (filter.operator === 'eq') {
        table = table.map(item => 
          item[filter.column] === filter.value 
            ? { ...item, ...data, updated_at: new Date().toISOString() }
            : item
        );
      }
    });

    if (this.table === 'viagens') mockData.viagens = table;
    if (this.table === 'reservas') mockData.reservas = table;

    return { data: table, error: null };
  }

  async execute() {
    // Simular busca
    let result = mockData[this.table] || [];

    // Aplicar filtros
    this.filters.forEach(filter => {
      if (filter.operator === 'eq') {
        result = result.filter(item => item[filter.column] === filter.value);
      }
    });

    // Aplicar ordenação
    if (this.orderBy) {
      result.sort((a, b) => {
        const aVal = a[this.orderBy.column];
        const bVal = b[this.orderBy.column];
        
        if (this.orderBy.ascending === false) {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    return { data: result, error: null };
  }
}

// Dados simulados (em produção virão do Supabase)
const mockData = {
  viagens: [
    {
      id: '1',
      destino: 'Gramado/RS',
      local_saida: 'Fortaleza/CE',
      data_ida: '2025-09-15',
      data_volta: '2025-09-18',
      limite_passageiros: 25,
      status: 'Aberta',
      link_publico: 'https://seuapp.com/inscricao?viagem=1',
      created_at: '2025-08-05T10:00:00Z'
    }
  ],
  reservas: [
    {
      id: '1',
      viagem_id: '1',
      nome_passageiro: 'João Silva',
      tipo_documento: 'CPF',
      numero_documento: '123.456.789-00',
      data_reserva: '2025-08-01T10:30:00Z',
      status_pagamento: 'Confirmado'
    },
    {
      id: '2',
      viagem_id: '1',
      nome_passageiro: 'Maria Santos',
      tipo_documento: 'RG',
      numero_documento: '12.345.678-9',
      data_reserva: '2025-08-02T14:20:00Z',
      status_pagamento: 'Aguardando Pagamento'
    }
  ]
};

// Instanciar cliente
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===========================================
// COMPONENTE PRINCIPAL
// ===========================================
const TravelBookingApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [copiedLink, setCopiedLink] = useState('');

  // Carregar dados quando autenticado
  useEffect(() => {
    if (user) {
      loadTrips();
      loadReservations();
    }
  }, [user]);

  // Carregar viagens
  const loadTrips = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('viagens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (err) {
      setError('Erro ao carregar viagens: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar reservas
  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (err) {
      setError('Erro ao carregar reservas: ' + err.message);
    }
  };

  // Login
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      setUser(data.user);
      setCurrentView('dashboard');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.signOut();
    setUser(null);
    setCurrentView('login');
    setTrips([]);
    setReservations([]);
  };

  // Criar viagem
  const createTrip = async (tripData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('viagens')
        .insert([tripData]);

      if (error) throw error;
      
      await loadTrips(); // Recarregar lista
      setCurrentView('dashboard');
    } catch (err) {
      setError('Erro ao criar viagem: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Confirmar pagamento
  const confirmPayment = async (reservationId) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('reservas')
        .update({ status_pagamento: 'Confirmado' })
        .eq('id', reservationId);

      if (error) throw error;
      
      await loadReservations(); // Recarregar lista
    } catch (err) {
      setError('Erro ao confirmar pagamento: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fazer reserva pública
  const makeReservation = async (reservationData, tripId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservas')
        .insert([{
          ...reservationData,
          viagem_id: tripId
        }]);

      if (error) throw error;
      
      alert('Reserva realizada com sucesso! Aguarde as instruções de pagamento.');
    } catch (err) {
      setError('Erro ao fazer reserva: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Copiar link
  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  // Contar reservas
  const getReservationCount = (tripId) => {
    return reservations.filter(r => r.viagem_id === tripId).length;
  };

  const getConfirmedCount = (tripId) => {
    return reservations.filter(r => 
      r.viagem_id === tripId && r.status_pagamento === 'Confirmado'
    ).length;
  };

  // ===========================================
  // COMPONENTE DE ERRO
  // ===========================================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Erro de Configuração</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700">{error}</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Configuração Necessária:</h3>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Criar projeto no Supabase</li>
                <li>Executar o script SQL fornecido</li>
                <li>Substituir SUPABASE_URL e SUPABASE_ANON_KEY no código</li>
                <li>Instalar a biblioteca: npm install @supabase/supabase-js</li>
              </ol>
            </div>
            
            <button
              onClick={() => {
                setError('');
                setCurrentView('login');
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // TELA DE LOGIN
  // ===========================================
  if (currentView === 'login' && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Gestão de Viagens</h1>
            <p className="text-gray-600">Versão integrada com Supabase</p>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            await handleLogin(email, password);
          }} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="admin@viagens.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>Credenciais de teste:</strong></p>
            <p className="text-sm text-gray-600">Email: admin@viagens.com</p>
            <p className="text-sm text-gray-600">Senha: 123456</p>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              <strong>⚠️ Configuração necessária:</strong><br />
              Substitua as credenciais do Supabase no código para usar dados reais.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // DASHBOARD
  // ===========================================
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Painel de Viagens {loading && '(Carregando...)'}
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('createTrip')}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Nova Viagem
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid gap-6">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{trip.destino}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Saída: {trip.local_saida}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(trip.data_ida).toLocaleDateString('pt-BR')} até {new Date(trip.data_volta).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {getReservationCount(trip.id)} / {trip.limite_passageiros} vagas
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trip.status === 'Aberta' ? 'bg-green-100 text-green-800' :
                    trip.status === 'Lotada' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {trip.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => copyLink(trip.link_publico)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    {copiedLink === trip.link_publico ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink === trip.link_publico ? 'Copiado!' : 'Copiar Link'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedTrip(trip);
                      setCurrentView('tripDetails');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Inscritos
                  </button>
                  
                  <button
                    onClick={() => {
                      const confirmedReservations = reservations.filter(r => 
                        r.viagem_id === trip.id && r.status_pagamento === 'Confirmado'
                      );
                      setSelectedTrip({ trip, reservations: confirmedReservations });
                      setCurrentView('passengerList');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Lista de Passageiros
                  </button>
                </div>
              </div>
            ))}

            {trips.length === 0 && !loading && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma viagem criada</h3>
                <p className="text-gray-500">Comece criando sua primeira viagem</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ===========================================
  // CRIAR VIAGEM
  // ===========================================
  if (currentView === 'createTrip') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Nova Viagem</h1>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              await createTrip({
                destino: formData.get('destino'),
                local_saida: formData.get('localSaida'),
                data_ida: formData.get('dataIda'),
                data_volta: formData.get('dataVolta'),
                limite_passageiros: parseInt(formData.get('limitePassageiros'))
              });
            }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destino
                  </label>
                  <input
                    type="text"
                    name="destino"
                    required
                    placeholder="Ex: Gramado/RS"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Local de Saída
                  </label>
                  <input
                    type="text"
                    name="localSaida"
                    required
                    placeholder="Ex: Fortaleza/CE"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Ida
                  </label>
                  <input
                    type="date"
                    name="dataIda"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Volta
                  </label>
                  <input
                    type="date"
                    name="dataVolta"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite de Passageiros
                  </label>
                  <input
                    type="number"
                    name="limitePassageiros"
                    required
                    min="1"
                    max="100"
                    placeholder="Ex: 25"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Criando...' : 'Criar Viagem'}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('dashboard')}
                  disabled={loading}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // ===========================================
  // DETALHES DA VIAGEM
  // ===========================================
  if (currentView === 'tripDetails') {
    const tripReservations = reservations.filter(r => r.viagem_id === selectedTrip.id);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{selectedTrip.destino}</h1>
              <p className="text-gray-600">
                {new Date(selectedTrip.data_ida).toLocaleDateString('pt-BR')} até {new Date(selectedTrip.data_volta).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Passageiros Inscritos ({tripReservations.length}/{selectedTrip.limite_passageiros})
                </h2>
                <div className="text-sm text-gray-600">
                  Confirmados: {getConfirmedCount(selectedTrip.id)}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data da Reserva
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tripReservations.map(reservation => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{reservation.nome_passageiro}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reservation.tipo_documento}: {reservation.numero_documento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(reservation.data_reserva).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          reservation.status_pagamento === 'Confirmado' ? 'bg-green-100 text-green-800' :
                          reservation.status_pagamento === 'Aguardando Pagamento' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {reservation.status_pagamento}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reservation.status_pagamento === 'Aguardando Pagamento' && (
                          <button
                            onClick={() => confirmPayment(reservation.id)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                          >
                            {loading ? 'Confirmando...' : 'Confirmar Pagamento'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tripReservations.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma inscrição ainda</h3>
                  <p className="text-gray-500">Compartilhe o link de inscrição para receber reservas</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ===========================================
  // LISTA DE PASSAGEIROS PARA IMPRIMIR
  // ===========================================
  if (currentView === 'passengerList') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b print:hidden">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Lista de Passageiros</h1>
            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Imprimir
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 print:shadow-none">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedTrip.trip.destino}</h2>
              <div className="text-gray-600 space-y-1">
                <p><strong>Saída:</strong> {selectedTrip.trip.local_saida}</p>
                <p><strong>Data de Ida:</strong> {new Date(selectedTrip.trip.data_ida).toLocaleDateString('pt-BR')}</p>
                <p><strong>Data de Volta:</strong> {new Date(selectedTrip.trip.data_volta).toLocaleDateString('pt-BR')}</p>
                <p><strong>Total de Passageiros Confirmados:</strong> {selectedTrip.reservations.length}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Nº</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Nome Completo</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Documento</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTrip.reservations.map((reservation, index) => (
                    <tr key={reservation.id}>
                      <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">{reservation.nome_passageiro}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {reservation.tipo_documento}: {reservation.numero_documento}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedTrip.reservations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhum passageiro confirmado ainda.</p>
              </div>
            )}

            <div className="mt-8 text-center text-sm text-gray-500 print:block">
              <p>Lista gerada em {new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Tela de loading ou fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando aplicação...</p>
      </div>
    </div>
  );
};

export default TravelBookingApp;
