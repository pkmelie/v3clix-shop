import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Edit2, Trash2, Save, X, Upload, Eye, Lock, Unlock } from 'lucide-react';

export default function V3clixStore() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [packs, setPacks] = useState([]);
  const [editingPack, setEditingPack] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = () => {
    try {
      const saved = localStorage.getItem('v3clix-packs');
      if (saved) {
        setPacks(JSON.parse(saved));
      } else {
        const defaultPacks = [
          {
            id: '1',
            name: 'Pack V3clix réaliste 1',
            price: 9.99,
            description: 'Premier pack de contenus réalistes',
            image: '',
            videoUrl: '',
            zipUrl: '',
            featured: true
          }
        ];
        setPacks(defaultPacks);
        localStorage.setItem('v3clix-packs', JSON.stringify(defaultPacks));
      }
    } catch (error) {
      console.log('Première utilisation');
    }
  };

  const savePacks = (newPacks) => {
    try {
      localStorage.setItem('v3clix-packs', JSON.stringify(newPacks));
      setPacks(newPacks);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const handleAddPack = () => {
    const newPack = {
      id: Date.now().toString(),
      name: `Pack V3clix réaliste ${packs.length + 1}`,
      price: 9.99,
      description: 'Description du pack',
      image: '',
      videoUrl: '',
      zipUrl: '',
      featured: false
    };
    setEditingPack(newPack);
    setShowAddForm(true);
  };

  const handleSavePack = () => {
    if (!editingPack.name || !editingPack.price) {
      alert('Nom et prix sont obligatoires');
      return;
    }

    const packExists = packs.find(p => p.id === editingPack.id);
    let newPacks;
    
    if (packExists) {
      newPacks = packs.map(p => p.id === editingPack.id ? editingPack : p);
    } else {
      newPacks = [...packs, editingPack];
    }

    savePacks(newPacks);
    setEditingPack(null);
    setShowAddForm(false);
  };

  const handleDeletePack = (packId) => {
    if (confirm('Supprimer ce pack ?')) {
      const newPacks = packs.filter(p => p.id !== packId);
      savePacks(newPacks);
    }
  };

  const handleBuyPack = async (pack) => {
    try {
      // Mapping des packs vers les Price IDs Stripe
      const priceMapping = {
        'Pack V3clix réaliste 1': 'price_1SduWB6merlTwGt5ipy9GwpD',
        // Ajoutez vos futurs packs ici avec leur Price ID
      };

      const priceId = priceMapping[pack.name];

      if (!priceId) {
        alert('Ce pack n\'est pas encore configuré dans Stripe');
        return;
      }

      // Appeler l'API pour créer la session Stripe
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          packName: pack.name,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = data.url;
      } else {
        alert('Erreur lors de la création de la session de paiement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue. Réessayez.');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingPack({...editingPack, image: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V3</span>
            </div>
            <h1 className="text-2xl font-bold text-white">V3clix Store</h1>
          </div>
          <button
            onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
            {isAdmin ? 'Quitter Admin' : 'Admin'}
          </button>
        </div>
      </header>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Connexion Admin</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Mot de passe"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdminLogin}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminPassword('');
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
            <p className="text-sm text-slate-400 mt-4">Mot de passe par défaut: admin123</p>
          </div>
        </div>
      )}

      {/* Edit/Add Pack Modal */}
      {(editingPack || showAddForm) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-purple-500/20 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {packs.find(p => p.id === editingPack?.id) ? 'Modifier' : 'Ajouter'} le pack
              </h2>
              <button
                onClick={() => {
                  setEditingPack(null);
                  setShowAddForm(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nom du pack</label>
                <input
                  type="text"
                  value={editingPack?.name || ''}
                  onChange={(e) => setEditingPack({...editingPack, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPack?.price || ''}
                  onChange={(e) => setEditingPack({...editingPack, price: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={editingPack?.description || ''}
                  onChange={(e) => setEditingPack({...editingPack, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Image (upload ou URL)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-2"
                />
                <input
                  type="text"
                  value={editingPack?.image || ''}
                  onChange={(e) => setEditingPack({...editingPack, image: e.target.value})}
                  placeholder="Ou coller une URL d'image"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
                {editingPack?.image && (
                  <img src={editingPack.image} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">URL Vidéo (YouTube, Vimeo, etc.)</label>
                <input
                  type="text"
                  value={editingPack?.videoUrl || ''}
                  onChange={(e) => setEditingPack({...editingPack, videoUrl: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">URL du fichier ZIP</label>
                <input
                  type="text"
                  value={editingPack?.zipUrl || ''}
                  onChange={(e) => setEditingPack({...editingPack, zipUrl: e.target.value})}
                  placeholder="https://votre-stockage.com/pack.zip"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
                <p className="text-xs text-slate-400 mt-1">Uploadez votre ZIP sur Contabo et collez le lien ici</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingPack?.featured || false}
                  onChange={(e) => setEditingPack({...editingPack, featured: e.target.checked})}
                  className="w-4 h-4"
                />
                <label className="text-sm text-slate-300">Pack en vedette</label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSavePack}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Save size={18} />
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setEditingPack(null);
                  setShowAddForm(false);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Packs V3clix <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Réalistes</span>
          </h2>
          <p className="text-xl text-slate-300">Accédez instantanément à vos contenus après paiement</p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-8 p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
            <div className="flex justify-between items-center">
              <p className="text-purple-300 font-medium">Mode Administration</p>
              <button
                onClick={handleAddPack}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus size={18} />
                Ajouter un pack
              </button>
            </div>
          </div>
        )}

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all hover:scale-105 ${
                pack.featured ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-slate-700'
              }`}
            >
              {pack.featured && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-1 text-sm font-semibold">
                  ⭐ EN VEDETTE
                </div>
              )}
              
              <div className="relative h-48 bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden">
                {pack.image ? (
                  <img src={pack.image} alt={pack.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload size={48} className="text-white/50" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{pack.name}</h3>
                <p className="text-slate-300 text-sm mb-4">{pack.description}</p>
                
                {pack.videoUrl && (
                  <a
                    href={pack.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-4 transition-colors"
                  >
                    <Eye size={16} />
                    Voir la vidéo de présentation
                  </a>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-white">{pack.price}€</span>
                </div>

                {isAdmin ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPack(pack)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeletePack(pack.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyPack(pack)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
                  >
                    <ShoppingCart size={20} />
                    Acheter maintenant
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {packs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">Aucun pack disponible pour le moment</p>
            {isAdmin && (
              <button
                onClick={handleAddPack}
                className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Créer le premier pack
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-purple-500/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400">
          <p>© 2024 V3clix Store - Tous droits réservés</p>
          <p className="text-sm mt-2">Paiements sécurisés via Stripe</p>
        </div>
      </footer>
    </div>
  );
}