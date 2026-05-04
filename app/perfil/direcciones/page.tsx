"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;700&display=swap');

  .address-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  .address-hero {
    padding: 72px 48px 48px;
    border-bottom: 1px solid #2A2620;
  }

  .address-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .address-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .address-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .address-subtitle {
    margin-top: 16px;
    font-size: 14px;
    color: #7A7268;
    font-weight: 300;
    max-width: 420px;
    line-height: 1.6;
  }

  .content-main {
    padding: 48px;
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 64px;
  }

  .form-section h2, .list-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    margin-bottom: 32px;
    border-bottom: 1px solid #2A2620;
    padding-bottom: 12px;
  }

  .address-form {
    display: grid;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #C17A3A;
  }

  .form-input {
    background: #161412;
    border: 1px solid #2A2620;
    padding: 14px;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    border-radius: 2px;
    transition: border-color 0.3s;
  }

  .form-input:focus {
    outline: none;
    border-color: #C17A3A;
  }

  .submit-btn {
    margin-top: 12px;
    background: #C17A3A;
    color: #111010;
    border: none;
    padding: 16px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
  }

  .submit-btn:hover {
    background: #D68F4A;
  }

  .address-grid {
    display: grid;
    gap: 20px;
  }

  .address-card {
    background: #161412;
    border: 1px solid #2A2620;
    padding: 24px;
    border-radius: 2px;
    position: relative;
    transition: all 0.3s;
  }

  .address-card:hover {
    border-color: #C17A3A;
  }

  .card-main {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .card-sub {
    font-size: 13px;
    color: #7A7268;
    line-height: 1.5;
  }

  .card-refs {
    margin-top: 12px;
    font-size: 12px;
    color: #C17A3A;
    font-style: italic;
  }

  .delete-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    background: transparent;
    border: 1px solid #3A1A1A;
    color: #B34A4A;
    padding: 4px 8px;
    font-size: 9px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }

  .delete-btn:hover {
    background: #B34A4A;
    color: #111010;
    border-color: #B34A4A;
  }

  .empty-state {
    text-align: center;
    padding: 48px;
    border: 1px dashed #2A2620;
    color: #7A7268;
    font-style: italic;
  }

  @media (max-width: 900px) {
    .content-main { grid-template-columns: 1fr; }
    .address-hero { padding: 48px 24px; }
  }
`

type Address = {
  id: number
  street: string
  exterior_number: string
  interior_number?: string
  neighborhood: string
  city: string
  state: string
  postal_code: string
  delivery_references?: string
}

export default function DireccionesPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [customerId, setCustomerId] = useState<string>("1")
  
  const [form, setForm] = useState({
    street: '',
    exterior_number: '',
    interior_number: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    delivery_references: ''
  })

  useEffect(() => {
    const savedId = sessionStorage.getItem("customerId") || "1"
    setCustomerId(savedId)
    loadAddresses(savedId)
  }, [])

  const loadAddresses = async (id: string) => {
    try {
      const res = await fetch(`/api/delivery-addresses?customerId=${id}`)
      if (res.ok) {
        const data = await res.json()
        setAddresses(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/delivery-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, customerId })
      })
      if (res.ok) {
        setForm({
          street: '', exterior_number: '', interior_number: '',
          neighborhood: '', city: '', state: '', postal_code: '',
          delivery_references: ''
        })
        loadAddresses(customerId)
        alert("Dirección guardada con éxito")
      }
    } catch (e) {
      alert("Error al guardar la dirección")
    }
  }

  const deleteAddress = async (id: number) => {
    if (!confirm("¿Eliminar esta dirección?")) return
    try {
      const res = await fetch(`/api/delivery-addresses?id=${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setAddresses(prev => prev.filter(a => a.id !== id))
        alert("Dirección eliminada")
      } else {
        const data = await res.json()
        alert(data.error || "Error al eliminar")
      }
    } catch (e) {
      console.error(e)
      alert("Error de conexión")
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="address-root">
        <header className="address-hero">
          <p className="address-label">Mi Perfil</p>
          <h1 className="address-title">Mis <em>Direcciones</em></h1>
          <p className="address-subtitle">
            Gestione sus ubicaciones de entrega para una experiencia más rápida y precisa.
          </p>
        </header>

        <main className="content-main">
          <section className="form-section">
            <h2>Nueva Dirección</h2>
            <form className="address-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Calle</label>
                <input 
                  className="form-input" 
                  value={form.street} 
                  onChange={e => setForm({...form, street: e.target.value})} 
                  required 
                  placeholder="Ej. Av. Reforma"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Núm. Exterior</label>
                  <input 
                    className="form-input" 
                    value={form.exterior_number} 
                    onChange={e => setForm({...form, exterior_number: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Núm. Interior</label>
                  <input 
                    className="form-input" 
                    value={form.interior_number} 
                    onChange={e => setForm({...form, interior_number: e.target.value})} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Colonia</label>
                <input 
                  className="form-input" 
                  value={form.neighborhood} 
                  onChange={e => setForm({...form, neighborhood: e.target.value})} 
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Ciudad</label>
                  <input 
                    className="form-input" 
                    value={form.city} 
                    onChange={e => setForm({...form, city: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Código Postal</label>
                  <input 
                    className="form-input" 
                    value={form.postal_code} 
                    onChange={e => setForm({...form, postal_code: e.target.value})} 
                    required 
                    pattern="[0-9]{5}"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Referencias</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '80px' }}
                  value={form.delivery_references} 
                  onChange={e => setForm({...form, delivery_references: e.target.value})} 
                  placeholder="Ej. Portón negro, frente al parque..."
                />
              </div>
              <button type="submit" className="submit-btn">Guardar Dirección</button>
            </form>
          </section>

          <section className="list-section">
            <h2>Direcciones Guardadas</h2>
            {loading ? (
              <div className="empty-state">Cargando direcciones...</div>
            ) : addresses.length === 0 ? (
              <div className="empty-state">No tienes direcciones registradas aún.</div>
            ) : (
              <div className="address-grid">
                {addresses.map(addr => (
                  <div className="address-card" key={addr.id}>
                    <div className="card-main">
                      {addr.street} {addr.exterior_number}
                      {addr.interior_number && ` Int. ${addr.interior_number}`}
                    </div>
                    <div className="card-sub">
                      Col. {addr.neighborhood}, {addr.city}, {addr.state} CP {addr.postal_code}
                    </div>
                    {addr.delivery_references && (
                      <div className="card-refs">
                        Ref: {addr.delivery_references}
                      </div>
                    )}
                    <button className="delete-btn" onClick={() => deleteAddress(addr.id)}>Eliminar</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  )
}
