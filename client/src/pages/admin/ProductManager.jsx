import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import styles from './Admin.module.css';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Personal Care', 'Sports & Fitness', 'Books'];

const EMPTY_FORM = { name: '', description: '', price: '', originalPrice: '', category: 'Electronics', brand: '', stock: '', isFeatured: false, tags: '' };

const ProductManager = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    getProducts({ limit: 100 })
      .then((d) => setProducts(d.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setImages([]); setEditProduct(null); setModalOpen(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice || '',
      category: p.category, brand: p.brand, stock: p.stock, isFeatured: p.isFeatured, tags: p.tags?.join(', ') || '',
    });
    setImages([]);
    setEditProduct(p);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));
      if (editProduct) {
        await updateProduct(editProduct._id, fd);
        addToast('Product updated!', 'success');
      } else {
        await createProduct(fd);
        addToast('Product created!', 'success');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      addToast(err, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      addToast('Product deleted', 'info');
      fetchProducts();
    } catch (err) { addToast(err, 'error'); }
  };

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div className={styles.dashHeader}>
          <h1>Product <span className="gradient-text">Manager</span></h1>
          <button className="btn btn-primary" onClick={openCreate} id="add-product-btn">+ Add Product</button>
        </div>

        {loading ? <Loader /> : (
          <div className={`glass-card ${styles.recentOrders}`}>
            <div className={styles.table}>
              <div className={`${styles.tableRow} ${styles.tableHead}`} style={{ gridTemplateColumns: '60px 1fr 100px 120px 80px 100px 100px' }}>
                <span>Image</span><span>Name</span><span>Price</span><span>Category</span><span>Stock</span><span>Featured</span><span>Actions</span>
              </div>
              {products.map((p) => {
                const imgSrc = p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `http://localhost:5000${p.images[0]}`) : null;
                return (
                  <div key={p._id} className={styles.tableRow} style={{ gridTemplateColumns: '60px 1fr 100px 120px 80px 100px 100px' }}>
                    <span>
                      {imgSrc ? <img src={imgSrc} alt={p.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem' }}>🛍️</span>}
                    </span>
                    <span style={{ fontWeight: 600, color: '#F1EEF9', fontSize: '0.875rem' }}>{p.name}</span>
                    <span>Rs {p.price.toLocaleString('en-LK')}</span>
                    <span>{p.category}</span>
                    <span style={{ color: p.stock === 0 ? '#EF4444' : '#22C55E' }}>{p.stock}</span>
                    <span>{p.isFeatured ? '✓' : '—'}</span>
                    <span style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)} id={`edit-product-${p._id}`}>Edit</button>
                      <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }} onClick={() => handleDelete(p._id)} id={`delete-product-${p._id}`}>Del</button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>{editProduct ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setModalOpen(false)} className={styles.closeBtn} id="close-modal-btn">✕</button>
              </div>
              <form onSubmit={handleSave} className={styles.modalForm} id="product-form">
                <div className={styles.modalGrid}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Product Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" required id="product-name" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input" rows={3} required id="product-desc" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (Rs)</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="form-input" required id="product-price" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Original Price (Rs)</label>
                    <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="form-input" id="product-orig-price" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="form-select" id="product-cat">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="form-input" required id="product-brand" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="form-input" required id="product-stock" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="form-input" id="product-tags" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Images</label>
                    <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} className="form-input" id="product-images" style={{ cursor: 'pointer' }} />
                    {editProduct?.images?.length > 0 && <p style={{ fontSize: '0.8rem', color: '#7A6A9B', marginTop: 4 }}>Current: {editProduct.images.length} image(s). Upload new to replace.</p>}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} id="product-featured" />
                      <span className="form-label" style={{ margin: 0 }}>Featured Product</span>
                    </label>
                  </div>
                </div>
                <div className={styles.modalBtns}>
                  <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} id="save-product-btn">{saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;
