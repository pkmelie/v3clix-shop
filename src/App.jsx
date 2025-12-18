import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Edit2, Trash2, Save, X, Upload, Eye, Lock, Unlock, CheckCircle, RefreshCw } from 'lucide-react';

export default function V3clixStore() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [packs, setPacks] = useState([]);
  const [editingPack, setEditingPack] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration Supabase - REMPLACEZ PAR VOS VALEURS
  const SUPABASE_URL = 'https://qmjszzqlyfnyhsvftwgi.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_ytpW_2-BKyGqPNQAJJWvdg_aN-XP6mm';

  useEffect(() => {
    // SEO
    document.title = "V3clix Shop - Packs GTA Réalistes et Contenus Graphiques Premium";

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = 'V3clix Shop - Boutique officielle de packs réalistes GTA et contenus graphiques premium. Téléchargement instantané.';

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = 'V3clix, v3clix shop, pack GTA, pack réaliste, contenu graphique, GTA RP';
    loadPacks();
    // Vérifier si on vient d'un paiement réussi
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowSuccess(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const loadPacks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/packs?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des packs');
      }

      const data = await response.json();
      setPacks(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les packs. Vérifiez votre configuration Supabase.');
      
      // Fallback sur des données par défaut
      const defaultPacks = [
        {
          id: 1,
          pack_id: 1,
          name: 'Pack V3clix réaliste 1',
          price: 9.99,
          description: 'Premier pack de contenus réalistes',
          image: '',
          video_url: '',
          zip_url: '',
          featured: true
        }
      ];
      setPacks(defaultPacks);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'Elieleo.312') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const handleAddPack = () => {
    const newPack = {
      name: `Pack V3clix réaliste ${packs.length + 1}`,
      price: 9.99,
      description: 'Description du pack',
      image: '',
      video_url: '',
      zip_url: '',
      featured: false
    };
    setEditingPack(newPack);
    setShowAddForm(true);
  };

  const handleSavePack = async () => {
    if (!editingPack.name || !editingPack.price) {
      alert('Nom et prix sont obligatoires');
      return;
    }

    try {
      setLoading(true);
      
      // Préparer les données pour Supabase (colonnes optionnelles)
      const packData = {
        name: editingPack.name,
        price: editingPack.price,
        description: editingPack.description || null,
        image: editingPack.image || null,
        video_url: editingPack.video_url || null,
        zip_url: editingPack.zip_url || null,
        featured: editingPack.featured || false,
        stripe_price_id: editingPack.stripe_price_id || null
      };

      let response;
      
      if (editingPack.id) {
        // Mise à jour d'un pack existant (utilise l'id, pas pack_id)
        response = await fetch(`${SUPABASE_URL}/rest/v1/packs?id=eq.${editingPack.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(packData)
        });
      } else {
        // Création d'un nouveau pack (pack_id sera auto-généré par Supabase)
        response = await fetch(`${SUPABASE_URL}/rest/v1/packs`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(packData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      alert('✅ Pack sauvegardé avec succès !');
      setEditingPack(null);
      setShowAddForm(false);
      await loadPacks(); // Recharger les packs
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la sauvegarde : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePack = async (packId) => {
    if (!confirm('Supprimer ce pack ?')) return;

    try {
      setLoading(true);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/packs?id=eq.${packId}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      alert('✅ Pack supprimé avec succès !');
      await loadPacks();
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la suppression : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPack = async (pack) => {
    try {
      const priceMapping = {
        'Pack V3clix réaliste 1': 'price_1Sf1pW4joDytcB3qtdTmS6eU',
        
      };

      const priceId = pack.stripe_price_id;

      if (!priceId) {
        alert('Ce pack n\'est pas encore configuré dans Stripe.');
        return;
      }

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
        window.location.href = data.url;
      } else {
        alert('Erreur lors de la création de la session de paiement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue. Réessayez.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('❌ Image trop grande (max 10 MB)');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('❌ Fichier invalide. Veuillez sélectionner une image.');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: reader.result,
              fileName: file.name.replace(/\.[^/.]+$/, ''),
            }),
          });

          const data = await response.json();

          if (data.success && data.url) {
            setEditingPack({...editingPack, image: data.url});
            alert('✅ Image uploadée avec succès !');
          } else {
            throw new Error(data.message || 'Upload failed');
          }
        } catch (error) {
          console.error('Erreur upload:', error);
          alert('❌ Erreur lors de l\'upload : ' + error.message);
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        alert('❌ Erreur lors de la lecture du fichier');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Une erreur est survenue');
      setUploading(false);
    }
  };

  // Page de succès
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 text-center border border-purple-500/20">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Paiement réussi ! 🎉</h1>
          <p className="text-slate-300 mb-6">
            Merci pour votre achat ! Vous allez recevoir un email avec le lien de téléchargement dans quelques instants.
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Vérifiez aussi vos spams si vous ne voyez pas l'email.
          </p>
          <button
            onClick={() => setShowSuccess(false)}
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
              {isAdmin ? 'Quitter Admin' : 'Admin'}
            </button>
          </div>
        </div>
      </header>

      {/* Erreur de configuration */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-300">⚠️ {error}</p>
            <p className="text-sm text-red-400 mt-2">
              Configurez SUPABASE_URL et SUPABASE_KEY dans le code, puis activez RLS sur votre table.
            </p>
          </div>
        </div>
      )}

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
            
          </div>
        </div>
      )}

      {/* Edit/Add Pack Modal */}
      {(editingPack || showAddForm) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-purple-500/20 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingPack?.id ? 'Modifier' : 'Ajouter'} le pack
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Nom du pack *</label>
                <input
                  type="text"
                  value={editingPack?.name || ''}
                  onChange={(e) => setEditingPack({...editingPack, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Pack V3clix réaliste 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Prix (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPack?.price || ''}
                  onChange={(e) => setEditingPack({...editingPack, price: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="9.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={editingPack?.description || ''}
                  onChange={(e) => setEditingPack({...editingPack, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Description du pack..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Image (upload ou URL)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {uploading && (
                  <div className="flex items-center gap-2 mb-2 text-purple-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                    <p className="text-sm">Upload en cours...</p>
                  </div>
                )}
                <input
                  type="text"
                  value={editingPack?.image || ''}
                  onChange={(e) => setEditingPack({...editingPack, image: e.target.value})}
                  placeholder="Ou coller une URL d'image"
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                />
                {editingPack?.image && (
                  <img src={editingPack.image} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">URL Vidéo (YouTube, Vimeo, etc.)</label>
                <input
                  type="text"
                  value={editingPack?.video_url || ''}
                  onChange={(e) => setEditingPack({...editingPack, video_url: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>

             
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Stribe Price ID</label>
                <input
                  type="text"
                  value={editingPack?.stripe_price_id || ''}
                  onChange={(e) => setEditingPack({...editingPack, stripe_price_id: e.target.value})}
                  placeholder="price_xxx..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
                <p className="text-xs text-slate-400 mt-1">Trouver le price ID et collez le lien ici</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={editingPack?.featured || false}
                  onChange={(e) => setEditingPack({...editingPack, featured: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm text-slate-300">Pack en vedette ⭐</label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSavePack}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
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
              <div>
                <p className="text-purple-300 font-medium">🔧 Mode Administration</p>
                <p className="text-sm text-purple-400 mt-1">Données synchronisées avec Supabase</p>
              </div>
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

        {/* Loading State */}
        {loading && packs.length === 0 && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Chargement des packs depuis Supabase...</p>
          </div>
        )}

        {/* Packs Grid */}
        {!loading && (
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
                  <p className="text-slate-300 text-sm mb-4">{pack.description || 'Aucune description disponible'}</p>
                  
                  {pack.video_url && (
                    <a
                      href={pack.video_url}
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
                    {isAdmin && (
                      <span className="text-xs text-slate-500">ID: {pack.pack_id || pack.id}</span>
                    )}
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
        )}

        {!loading && packs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-2">Aucun pack disponible pour le moment</p>
            <p className="text-sm text-slate-500 mb-6">Les packs créés apparaîtront ici automatiquement</p>
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-slate-400">© 2025 V3clix Store - Tous droits réservés</p>
              <a
                href="https://discord.gg/QykwfUTKc5" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                title="Rejoindre notre Discord"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </a>
            </div>
            <p className="text-sm text-slate-400">Paiements sécurisés via Stripe</p>
          </div>
        </div>
      </footer>
    </div>
  );
}