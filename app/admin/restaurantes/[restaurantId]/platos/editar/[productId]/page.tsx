// app/admin/restaurantes/[restaurantId]/platos/editar/[productId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .edit-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
    padding-bottom: 48px;
  }

  /* Hero */
  .edit-hero {
    position: relative;
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
    overflow: hidden;
    animation: fadeDown 0.7s ease both;
  }

  .edit-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, #3D1F0A44, transparent);
    pointer-events: none;
  }

  .edit-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .edit-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .edit-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .edit-subtitle {
    margin-top: 16px;
    font-size: 14px;
    color: #7A7268;
    font-weight: 300;
    max-width: 420px;
    line-height: 1.6;
  }

  /* Contenido principal */
  .edit-content {
    padding: 32px 48px;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  /* Secciones */
  .edit-section {
    margin-bottom: 48px;
  }

  .edit-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 24px;
    letter-spacing: -0.02em;
    border-bottom: 1px solid #2A2620;
    padding-bottom: 12px;
  }

  .edit-section-title span {
    color: #C17A3A;
    font-style: italic;
    font-weight: 400;
    margin-left: 8px;
  }

  /* Grupo de acciones (botones) */
  .action-group {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 32px;
  }

  /* Botones */
  .edit-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 12px 24px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;
    background: transparent;
    border: 1px solid #2A2620;
    color: #7A7268;
  }

  .edit-btn:hover {
    border-color: #C17A3A;
    color: #C17A3A;
  }

  .edit-btn.primary {
    background: #C17A3A;
    border-color: #C17A3A;
    color: #111010;
  }

  .edit-btn.primary:hover {
    background: #D68F4A;
    border-color: #D68F4A;
  }

  .edit-btn.warning {
    border-color: #B34A4A;
    color: #B34A4A;
  }

  .edit-btn.warning:hover {
    background: #B34A4A;
    color: #111010;
  }

  .edit-btn.danger {
    background: #111010;
    border-color: #7A7268;
    color: #F2EDE4;
  }

  .edit-btn.danger:hover {
    background: #2A2620;
    border-color: #F2EDE4;
  }

  /* Campos de formulario */
  .form-row {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .edit-input {
    background: #1A1714;
    border: 1px solid #2A2620;
    padding: 12px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #F2EDE4;
    border-radius: 2px;
    min-width: 240px;
    flex: 1;
  }

  .edit-input:focus {
    outline: none;
    border-color: #C17A3A;
  }

  .edit-input::placeholder {
    color: #4A4540;
    font-weight: 300;
  }

  /* File input */
  .file-input-wrapper {
    position: relative;
    display: inline-block;
  }

  .file-input-wrapper input[type="file"] {
    position: absolute;
    left: -9999px;
    opacity: 0;
  }

  .file-label {
    display: inline-block;
    background: #1A1714;
    border: 1px solid #2A2620;
    padding: 12px 24px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #7A7268;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;
  }

  .file-label:hover {
    border-color: #C17A3A;
    color: #C17A3A;
  }

  .file-name {
    margin-left: 16px;
    font-size: 12px;
    color: #7A7268;
    font-style: italic;
  }

  /* Grid de imágenes */
  .images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
    margin-top: 24px;
  }

  .image-card {
    background: #1A1714;
    border: 1px solid #2A2620;
    border-radius: 2px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .image-card:hover {
    border-color: #C17A3A;
    transform: translateY(-2px);
  }

  .image-card img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    display: block;
  }

  .image-actions {
    padding: 12px;
  }

  .image-actions .edit-btn {
    width: 100%;
    text-align: center;
    padding: 8px;
    font-size: 11px;
  }

  .empty-message {
    color: #3A3630;
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-style: italic;
    padding: 40px;
    text-align: center;
    border: 1px dashed #2A2620;
  }

  /* Footer */
  .edit-footer {
    padding: 24px 48px 0;
    border-top: 1px solid #1E1C19;
    font-size: 11px;
    color: #3A3630;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    animation: fadeUp 0.6s 0.3s ease both;
  }

  /* Animaciones */
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 600px) {
    .edit-hero { padding: 48px 24px 32px; }
    .edit-content { padding: 24px; }
    .form-row { flex-direction: column; align-items: stretch; }
    .edit-input { width: 100%; }
    .edit-footer { padding: 20px 24px; flex-direction: column; gap: 8px; }
  }
`;

type ProductImage = {
  id: number;
  image_path: string;
  is_primary: boolean;
};

type Availability = {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export default function EditarPlato() {
  const params = useParams();
  const productId = Number(params.productId);

  const [images, setImages] = useState<ProductImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [descripcion, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: 1,
    start_time: '',
    end_time: ''
  });
  const [editingSchedule, setEditingSchedule] = useState<Availability | null>(null);

  const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const formatDay = (d: number) => daysMap[d] ?? 'Desconocido';

  /* ===============================
     Cargar imágenes y datos del producto
  =============================== */

  const loadProduct = async () => {
    try {
      const res = await fetch(`/api/platos/${productId}`);
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      const product = data.product;

      setName(product.name || '');
      setDescription(product.descripcion || '');
      setPrice(product.base_price?.toString() || '');
      setStock(product.stock?.toString() || '');

    } catch (err) {
      console.error(err);
    }
  };

  const loadImages = async () => {
    try {
      const res = await fetch(`/api/platos/${productId}/images`);
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAvailability = async () => {
    try {
      const res = await fetch(`/api/platos/${productId}/availability`);
      const data = await res.json();
      setAvailability(data.availability || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!productId) return;

    loadImages();
    loadProduct();
    loadAvailability();
  }, [productId]);
  /* ===============================
     SUBIR IMAGEN
  =============================== */

  const onUpload = async () => {
    if (!file) return alert('Selecciona un archivo');

    setLoading(true);

    const reader = new FileReader();

    reader.onload = async () => {
      const payload = {
        fileName: file.name,
        data: reader.result,
        format: file.type.split('/').pop(),
        isPrimary: true,
      };

      const res = await fetch(`/api/platos/${productId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j = await res.json();

      setLoading(false);

      if (j.error) {
        alert(j.error);
        return;
      }

      alert('Imagen subida');
      setFile(null);
      loadImages();
    };

    reader.readAsDataURL(file);
  };

  /* ===============================
     ELIMINAR IMAGEN
  =============================== */

  const deleteImage = async (imageId: number) => {
    if (!confirm('¿Eliminar imagen?')) return;

    const res = await fetch(`/api/platos/images/${imageId}`, {
      method: 'DELETE',
    });

    const j = await res.json();

    if (j.error) {
      alert(j.error);
      return;
    }

    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  /* ===============================
     ELIMINAR PERMANENTE
  =============================== */

  const deletePermanent  = async () => {
    if (!confirm('¿Eliminar permanentemente?')) return;

    const res = await fetch(`/api/platos/${productId}/delete`, {
      method: 'DELETE',
    });

    const j = await res.json();

    if (j.error) {
      alert(j.error);
      return;
    }

    alert('Plato eliminado permanentemente');
  };

  /* ===============================
     ACTIVAR PLATO
  =============================== */

  const activateProduct = async () => {
    const res = await fetch(`/api/platos/${productId}/activate`, {
      method: 'PATCH',
    });

    const j = await res.json();

    if (j.error) {
      alert(j.error);
      return;
    }

    alert('Plato activado');
  };

  /* ===============================
     DESACTIVAR PLATO
  =============================== */

  const deactivateProduct = async () => {
    if (!confirm('Desactivar plato?')) return;

    const res = await fetch(`/api/platos/${productId}/desactivate`, {
      method: 'PATCH',
    });

    const j = await res.json();

    if (j.error) {
      alert(j.error);
      return;
    }

    alert('Producto desactivado');
  };

  /* ===============================
     ACTUALIZAR PRECIO
  =============================== */

  const updatePrice = async () => {
    const res = await fetch(`/api/platos/${productId}/price`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: Number(price) }),
    });

    const j = await res.json();

    if (j.error) alert(j.error);
    else alert('Precio actualizado');
  };

  /* ===============================
     ACTUALIZAR STOCK
  =============================== */

  const updateStock = async () => {
    const res = await fetch(`/api/platos/${productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: Number(stock) }),
    });

    const j = await res.json();

    if (j.error) alert(j.error);
    else alert('Stock actualizado');
  };

  /* ===============================
     ACTUALIZAR NOMBRE
  =============================== */

  const updateName = async () => {
    const res = await fetch(`/api/platos/${productId}/nombre`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const j = await res.json();

    if (j.error) alert(j.error);
    else alert('Nombre actualizado');
  };

  /* ===============================
     ACTUALIZAR DESCRIPCIÓN
  =============================== */

  const updateDescription = async () => {
    const res = await fetch(`/api/platos/${productId}/descripcion`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion }),
    });

    const j = await res.json();

    if (j.error) alert(j.error);
    else alert('Descripción actualizada');
  };

  const createSchedule = async () => {
    if (!newSchedule.start_time || !newSchedule.end_time) return alert("Completa las horas");
    try {
      const res = await fetch(`/api/platos/${productId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek: newSchedule.day_of_week,
          startTime: newSchedule.start_time,
          endTime: newSchedule.end_time
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvailability(prev => [...prev, data.availability]);
      setNewSchedule({ day_of_week: 1, start_time: '', end_time: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateSchedule = async () => {
    if (!editingSchedule) return;
    try {
      const res = await fetch(`/api/platos/${productId}/availability/${editingSchedule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek: editingSchedule.day_of_week,
          startTime: editingSchedule.start_time,
          endTime: editingSchedule.end_time
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvailability(prev => prev.map(a => (a.id === editingSchedule.id ? data.availability : a)));
      setEditingSchedule(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteSchedule = async (id: number) => {
    if(!confirm("¿Eliminar este horario?")) return;
    try {
      const res = await fetch(`/api/platos/${productId}/availability/${id}`, { method: 'DELETE' });
      if (res.ok) setAvailability(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert("Error al eliminar");
    }
  };

  /* ===============================
     UI
  =============================== */

  return (
    <>
      <style>{styles}</style>
      <div className="edit-root">
        <header className="edit-hero">
          <p className="edit-label">Administración</p>
          <h1 className="edit-title">
            Editar <em>Plato #{productId}</em>
          </h1>
          <p className="edit-subtitle">
            Modifica la información, imágenes y disponibilidad del plato.
          </p>
        </header>

        <div className="edit-content">
          {/* ACCIONES (Activar/Desactivar/Eliminar) */}
          <section className="edit-section">
            <h2 className="edit-section-title">
              Acciones <span>del plato</span>
            </h2>
            <div className="action-group">
              <button onClick={deactivateProduct} className="edit-btn warning">
                Desactivar
              </button>
              <button onClick={activateProduct} className="edit-btn primary">
                Activar
              </button>
              <button onClick={deletePermanent} className="edit-btn danger">
                Eliminar permanente
              </button>
            </div>
          </section>

          {/* PRECIO */}
          <section className="edit-section">
            <h2 className="edit-section-title">
              Precio <span>y Stock</span>
            </h2>
            <div className="form-row">
              <input
                type="number"
                placeholder="Nuevo precio"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="edit-input"
              />
              <button onClick={updatePrice} className="edit-btn primary">
                Actualizar precio
              </button>
            </div>

            {/* STOCK */}
            <div className="form-row">
              <input
                type="number"
                placeholder="Nuevo stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="edit-input"
              />
              <button onClick={updateStock} className="edit-btn primary">
                Actualizar stock
              </button>
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="Nombre del plato"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="edit-input"
              />
              <button onClick={updateName} className="edit-btn primary">
                Actualizar nombre
              </button>
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="Descripción"
                value={descripcion}
                onChange={(e) => setDescription(e.target.value)}
                className="edit-input"
              />
              <button onClick={updateDescription} className="edit-btn primary">
                Actualizar descripción
              </button>
            </div>
          </section>

          <section className="edit-section">
            <h2 className="edit-section-title">
              Horarios <span>de disponibilidad</span>
            </h2>
            {editingSchedule && (
              <div className="edit-section" style={{ marginTop: '20px' }}>
                <h3>Editar Horario</h3>

                <div className="form-row">
                  <select
                    value={editingSchedule.day_of_week}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        day_of_week: Number(e.target.value)
                      })
                    }
                    className="edit-input"
                  >
                    {daysMap.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>

                  <input
                    type="time"
                    value={editingSchedule.start_time}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        start_time: e.target.value
                      })
                    }
                    className="edit-input"
                  />

                  <input
                    type="time"
                    value={editingSchedule.end_time}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        end_time: e.target.value
                      })
                    }
                    className="edit-input"
                  />

                  <button onClick={updateSchedule} className="edit-btn primary">
                    Guardar cambios
                  </button>

                  <button
                    onClick={() => setEditingSchedule(null)}
                    className="edit-btn warning"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* FORM CREAR */}
            <div className="form-row">
              <select
                value={newSchedule.day_of_week}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, day_of_week: Number(e.target.value) })
                }
                className="edit-input"
              >
                {daysMap.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={newSchedule.start_time}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, start_time: e.target.value })
                }
                className="edit-input"
              />

              <input
                type="time"
                value={newSchedule.end_time}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, end_time: e.target.value })
                }
                className="edit-input"
              />

              <button onClick={createSchedule} className="edit-btn primary">
                Agregar horario
              </button>
            </div>

            {/* LISTA DE HORARIOS */}
            <div style={{ marginTop: '20px' }}>
              {availability.length === 0 ? (
                <p className="empty-message">
                  Sin horarios → Disponible todo el día
                </p>
              ) : (
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Inicio</th>
                      <th>Fin</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availability.map((a) => (
                      <tr key={a.id}>
                        <td>{formatDay(a.day_of_week)}</td>
                        <td>{a.start_time}</td>
                        <td>{a.end_time}</td>
                        <td>
                          <button
                            onClick={() => setEditingSchedule(a)}
                            className="edit-btn primary"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => deleteSchedule(a.id)}
                            className="edit-btn danger"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* SUBIR IMAGEN */}
          <section className="edit-section">
            <h2 className="edit-section-title">
              Imágenes <span>del plato</span>
            </h2>
            <div className="form-row">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-upload" className="file-label">
                  Seleccionar archivo
                </label>
                <span className="file-name">
                  {file ? file.name : 'Ningún archivo seleccionado'}
                </span>
              </div>
              <button
                onClick={onUpload}
                disabled={loading}
                className="edit-btn primary"
              >
                {loading ? 'Subiendo...' : 'Subir imagen'}
              </button>
            </div>

            {/* LISTA DE IMÁGENES */}
            <div className="images-grid">
              {images.length === 0 && (
                <div className="empty-message">No hay imágenes</div>
              )}
              {images.map((img) => (
                <div key={img.id} className="image-card">
                  <img src={img.image_path} alt="" />
                  <div className="image-actions">
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="edit-btn danger"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="edit-footer">
          <span>Sistema de Administración</span>
          <span>{images.length} imágenes</span>
        </footer>
      </div>
    </>
  );
}