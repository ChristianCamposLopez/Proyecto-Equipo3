//admin/platos/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .admin-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  /* ... Estilos del Hero y Listado (omitidos por brevedad, se mantienen iguales) ... */
  .admin-hero { position: relative; padding: 72px 48px 48px; border-bottom: 1px solid #2A2620; }
  .admin-label { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #C17A3A; margin-bottom: 12px; }
  .admin-title { font-family: 'Playfair Display', serif; font-size: clamp(40px, 6vw, 72px); font-weight: 700; }
  .admin-title em { font-style: italic; font-weight: 400; color: #C17A3A; }
  .admin-subtitle { margin-top: 16px; font-size: 14px; color: #7A7268; max-width: 420px; line-height: 1.6; }

  /* Estilos del Formulario */
  .create-section { padding: 24px 48px; border-bottom: 1px solid #2A2620; background: #161411; }
  .create-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 800px; margin-top: 20px; }
  
  .create-form input, .create-form textarea {
    background: #111010; border: 1px solid #2A2620; color: #F2EDE4;
    padding: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; border-radius: 2px; outline: none;
  }
  .create-form input:focus { border-color: #C17A3A; }

  /* Área de Imagen */
  .image-upload-wrapper {
    grid-column: span 2;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    border: 1px dashed #2A2620;
    border-radius: 2px;
    background: #111010;
    text-align: center;
  }

  .image-preview {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 4px;
    margin: 10px auto;
    border: 1px solid #C17A3A;
  }

  .file-input-label {
    font-size: 12px;
    color: #7A7268;
    cursor: pointer;
    text-decoration: underline;
  }

  .full-width { grid-column: span 2; }
  .admin-list { padding: 32px 48px; }
  .admin-card { border-bottom: 1px solid #2A2620; padding: 20px 0; display: flex; align-items: center; justify-content: space-between; }
  .admin-edit-btn {
    background: #C17A3A; color: #111010; font-size: 12px; font-weight: 500;
    text-transform: uppercase; padding: 10px 24px; border: none; cursor: pointer;
    text-decoration: none; border-radius: 2px;
  }
  .btn-secondary { background: transparent; border: 1px solid #2A2620; color: #7A7268; margin-right: 10px; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .loader-ring { width: 36px; height: 36px; border: 2px solid #2A2620; border-top-color: #C17A3A; border-radius: 50%; animation: spin 0.9s linear infinite; }
  /* Estilo personalizado para el select de categorías - solo visual, sin JS extra */
  .custom-category-select {
    appearance: none;
    -webkit-appearance: none;
    background-color: #111010;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23C17A3A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 14px;
    cursor: pointer;
  }

  .custom-category-select:hover {
    border-color: #C17A3A;
  }

  .custom-category-select option {
    background-color: #111010;
    color: #F2EDE4;
    padding: 10px;
  }

  /* Para navegadores Firefox */
  @-moz-document url-prefix() {
    .custom-category-select {
      background-color: #111010;
      color: #F2EDE4;
    }
  }
`;

type Availability = {
  id: number;
  product_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type Product = {
  id: number;
  name: string;
  base_price: string;
  is_available?: boolean;
  availability?: Availability[];
};

// Extendemos el estado del formulario para incluir datos de imagen
interface FormState {
  name: string;
  base_price: string;
  stock: string;
  category_id: string;
  description: string;
  image: string | null;
  fileName: string;
  format: string;
}

export default function AdminPlatosPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    base_price: '',
    stock: '',
    category_id: '',
    description: '',
    image: null,
    fileName: '',
    format: ''
  });

  useEffect(() => {
    async function load() {
      const resId = '1'; // fijo
      try {
        // 🔹 Cargar productos
        const res = await fetch(`/api/platos?restaurantId=${resId}&includeInactive=true`);
        const data = await res.json();

        // 🔹 Cargar categorías
        const catRes = await fetch(`/api/categorias?restaurantId=${resId}`);
        const catData = await catRes.json();
        setCategories(catData.categories || []);

        const productsWithAvailability = await Promise.all(
          (data.products || []).map(async (product: Product) => {
            try {
              const res = await fetch(`/api/platos/${product.id}/availability`);
              const avData = await res.json();
              return {
                ...product,
                availability: avData.availability || []
              };
            } catch {
              return { ...product, availability: [] };
            }
          })
        );

        setProducts(productsWithAvailability);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  const daysMap = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

  function formatDay(day: number) {
    return daysMap[day] ?? 'Desconocido';
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm({
        ...form,
        image: reader.result as string,
        fileName: file.name,
        format: file.type.split('/')[1]
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!form.category_id) {
      alert("Debes seleccionar una categoría");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Crear el plato
      const res = await fetch('/api/platos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: 1,
          name: form.name,
          base_price: Number(form.base_price),
          stock: Number(form.stock),
          category_id: Number(form.category_id),
          descripcion: form.description.trim() === "" ? null : form.description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear plato');

      const newProduct = data.product;

      // 2. Subir imagen (Si el usuario seleccionó una)
      if (form.image && newProduct.id) {
        const imgRes = await fetch(`/api/platos/${newProduct.id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: form.fileName,
            data: form.image,
            format: form.format,
            isPrimary: true
          })
        });
        if (!imgRes.ok) console.warn("Plato creado, pero la imagen falló.");
      }

      // 3. Éxito
      setProducts(prev => [newProduct, ...prev]);
      setForm({ name: '', base_price: '', stock: '', category_id: '', description: '', image: null, fileName: '', format: '' });
      setShowCreateForm(false);
      alert('¡Plato creado con éxito!');

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="admin-root"><div className="admin-loading"><div className="loader-ring" /></div></div>;

  return (
    <>
      <style>{styles}</style>
      <div className="admin-root">
        <header className="admin-hero">
          <p className="admin-label">Administración</p>
          <h1 className="admin-title">Gestión de <em>Platos</em></h1>
        </header>

        <div className="create-section">
          {!showCreateForm ? (
            <button onClick={() => setShowCreateForm(true)} className="admin-edit-btn">+ Nuevo plato</button>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Playfair Display' }}>Nuevo Plato</h3>
                <button onClick={() => setShowCreateForm(false)} className="admin-edit-btn btn-secondary">Cancelar</button>
              </div>
              
              <form onSubmit={handleSubmit} className="create-form">
                <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required className="full-width" />
                <input name="base_price" type="number" placeholder="Precio" value={form.base_price} onChange={handleChange} required />
                <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  required
                  className="full-width custom-category-select"  
                >
                  <option value="">Selecciona una categoría</option>

                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <textarea name="description" placeholder="Descripción (opcional)" value={form.description} onChange={handleChange} className="full-width" />

                {/* --- SECCIÓN DE IMAGEN --- */}
                <div className="image-upload-wrapper">
                  <span style={{ fontSize: '14px', color: '#F2EDE4' }}>Foto del Plato (Opcional)</span>
                  {form.image && <img src={form.image} alt="Preview" className="image-preview" />}
                  <label className="file-input-label">
                    {form.image ? 'Cambiar foto' : 'Haga clic para seleccionar foto'}
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>

                <button type="submit" className="admin-edit-btn full-width" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Plato'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="admin-list">
          {products.map(p => (
            <div key={p.id} className="admin-card">
              
              <div className="admin-info">
                <h2 className="admin-name">{p.name}</h2>

                <div className="admin-meta">
                  <span className="admin-price">${p.base_price} MXN</span>
                </div>

                {/* ================= HORARIOS ================= */}
                <div style={{ marginTop: '10px' }}>
                  <strong style={{ fontSize: '13px' }}>Horarios:</strong>

                  {(!p.availability || p.availability.length === 0) ? (
                    <p style={{ fontSize: '13px', opacity: 0.7 }}>
                      Disponible todo el día
                    </p>
                  ) : (
                    <ul style={{ fontSize: '13px', marginTop: '5px' }}>
                      {p.availability.map(av => (
                        <li key={av.id}>
                          {formatDay(av.day_of_week)}: {av.start_time} - {av.end_time}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* ========================================== */}

              </div>

              <Link 
                href={`/admin/platos/editar/${p.id}`} 
                className="admin-edit-btn"
              >
                Editar
              </Link>

            </div>
          ))}
        </div>
      </div>
    </>
  );
}