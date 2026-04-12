"use client"
// app/admin/productos/imagenes/page.tsx — US009.2 y US009.3

import { useEffect, useRef, useState } from "react"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .adm-root {
    min-height: 100vh;
    background: #111010;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
  }

  /* Header */
  .adm-header {
    padding: 40px 48px 32px;
    border-bottom: 1px solid #2A2620;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    animation: fadeDown 0.5s ease both;
  }

  .adm-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 8px;
  }

  .adm-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
  }

  .adm-title em { font-style: italic; font-weight: 400; color: #C17A3A; }

  .adm-count {
    font-size: 12px;
    color: #7A7268;
    letter-spacing: 0.08em;
  }

  /* Search */
  .adm-search-wrap {
    padding: 20px 48px;
    border-bottom: 1px solid #1E1C19;
    animation: fadeUp 0.5s 0.05s ease both;
  }

  .adm-search {
    width: 100%;
    max-width: 400px;
    background: #1A1714;
    border: 1px solid #2A2620;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    padding: 10px 16px;
    outline: none;
    transition: border-color 0.2s;
  }

  .adm-search:focus { border-color: #C17A3A; }
  .adm-search::placeholder { color: #3A3630; }

  /* Table */
  .adm-table-wrap {
    padding: 0 48px 48px;
    animation: fadeUp 0.5s 0.1s ease both;
  }

  .adm-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 24px;
  }

  .adm-table thead tr {
    border-bottom: 1px solid #2A2620;
  }

  .adm-table th {
    padding: 10px 16px;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #7A7268;
    font-weight: 400;
    text-align: left;
  }

  .adm-table th:last-child { text-align: right; }

  .adm-table tbody tr {
    border-bottom: 1px solid #1E1C19;
    transition: background 0.15s;
    opacity: 0;
    animation: rowIn 0.4s ease forwards;
  }

  .adm-table tbody tr:hover { background: #161411; }

  .adm-table td {
    padding: 16px;
    vertical-align: middle;
  }

  /* Thumbnail */
  .thumb-wrap {
    width: 64px;
    height: 48px;
    background: #1A1714;
    border: 1px solid #2A2620;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-empty {
    color: #3A3630;
  }

  .prod-name {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 700;
  }

  .prod-category {
    font-size: 11px;
    color: #C17A3A;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .prod-price {
    font-size: 14px;
    color: #7A7268;
  }

  .prod-cell {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  /* Status badge */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    letter-spacing: 0.08em;
    padding: 4px 10px;
    border: 1px solid;
  }

  .status-badge.has-img { border-color: #2A6A3A; color: #4CAF70; }
  .status-badge.no-img  { border-color: #3A2A1A; color: #7A5A3A; }
  .status-badge.available { border-color: #2A6A3A; color: #4CAF70; }
  .status-badge.sold-out  { border-color: #5A2020; color: #C04040; }

  .status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
  }

  /* Actions */
  .actions-cell {
    text-align: right;
    white-space: nowrap;
  }

  .stock-cell {
    min-width: 240px;
  }

  .stock-tools {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .stock-input {
    width: 84px;
    background: #1A1714;
    border: 1px solid #2A2620;
    color: #F2EDE4;
    padding: 8px 10px;
    font-size: 13px;
    outline: none;
  }

  .stock-input:focus {
    border-color: #C17A3A;
  }

  .stock-helper {
    margin-top: 8px;
    font-size: 11px;
    color: #7A7268;
    letter-spacing: 0.05em;
  }

  .btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 8px 16px;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
  }

  .btn-upload {
    border-color: #C17A3A;
    color: #C17A3A;
  }

  .btn-upload:hover {
    background: #C17A3A;
    color: #111010;
  }

  .btn-delete {
    border-color: #5A2020;
    color: #C04040;
    margin-left: 8px;
  }

  .btn-delete:hover {
    background: #C04040;
    color: #111010;
    border-color: #C04040;
  }

  .btn-stock {
    border-color: #2A2620;
    color: #F2EDE4;
  }

  .btn-stock:hover {
    border-color: #F2EDE4;
  }

  .btn-soldout {
    border-color: #5A2020;
    color: #C04040;
  }

  .btn-soldout:hover {
    background: #C04040;
    color: #111010;
    border-color: #C04040;
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Upload modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: #111010CC;
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.2s ease both;
  }

  .modal {
    background: #1A1714;
    border: 1px solid #2A2620;
    width: 100%;
    max-width: 480px;
    padding: 36px;
    animation: scaleIn 0.25s ease both;
  }

  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .modal-sub {
    font-size: 12px;
    color: #C17A3A;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 28px;
  }

  .drop-zone {
    border: 2px dashed #2A2620;
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
  }

  .drop-zone.dragging {
    border-color: #C17A3A;
    background: #C17A3A11;
  }

  .drop-zone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .drop-icon { color: #3A3630; margin-bottom: 12px; }

  .drop-text {
    font-size: 13px;
    color: #7A7268;
    line-height: 1.6;
  }

  .drop-text strong { color: #C17A3A; }

  .preview-wrap {
    margin-top: 20px;
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
    border: 1px solid #2A2620;
    background: #111010;
  }

  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-remove {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #C04040;
    border: none;
    color: white;
    width: 28px;
    height: 28px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    justify-content: flex-end;
  }

  .btn-cancel {
    border-color: #2A2620;
    color: #7A7268;
  }

  .btn-cancel:hover { border-color: #7A7268; color: #F2EDE4; }

  .btn-confirm {
    border-color: #C17A3A;
    color: #C17A3A;
  }

  .btn-confirm:hover {
    background: #C17A3A;
    color: #111010;
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 32px;
    right: 32px;
    padding: 14px 24px;
    font-size: 13px;
    letter-spacing: 0.06em;
    z-index: 200;
    animation: slideToast 0.3s ease both;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toast.success { background: #1A3A24; border: 1px solid #2A6A3A; color: #4CAF70; }
  .toast.error   { background: #3A1A1A; border: 1px solid #6A2A2A; color: #C04040; }

  /* Loading states */
  .adm-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 16px;
    color: #7A7268;
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 2px solid #2A2620;
    border-top-color: #C17A3A;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* Animations */
  @keyframes fadeDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(12px);  } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes rowIn    { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
  @keyframes slideToast { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

  @media (max-width: 700px) {
    .adm-header     { padding: 32px 20px 24px; flex-direction: column; align-items: flex-start; gap: 8px; }
    .adm-search-wrap { padding: 16px 20px; }
    .adm-table-wrap { padding: 0 20px 40px; }
    .modal          { margin: 16px; padding: 24px; }
    .stock-cell     { min-width: 200px; }
  }
`

type Product = {
  id: number
  name: string
  base_price: number
  stock: number
  is_available: boolean
  image_url: string | null
  category_name: string
}

type Toast = { msg: string; type: "success" | "error" } | null

export default function AdminImagenesPage() {
  const [products, setProducts] = useState<Product[]>([])

  const sampleProducts: Product[] = [
    { id: 100, name: 'Hamburguesa de ejemplo', base_price: 85, stock: 8, is_available: true, image_url: null, category_name: 'Hamburguesas' },
    { id: 101, name: 'Taco de ejemplo', base_price: 35, stock: 0, is_available: false, image_url: null, category_name: 'Tacos' },
  ];
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<Product | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [savingStock, setSavingStock] = useState<number | null>(null)
  const [stockInputs, setStockInputs] = useState<Record<number, string>>({})
  const [toast, setToast] = useState<Toast>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/menu/products")
      .then(async (r) => {
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      })
      .then((data) => {
        const productsData = data as Product[]
        setProducts(productsData)
        setStockInputs(
          Object.fromEntries(productsData.map((product) => [product.id, String(product.stock)]))
        )
      })
      .finally(() => setLoading(false));
  }, [])

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleFileSelect(f: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      return showToast("Formato no válido. Usa JPG, PNG o WEBP.", "error")
    }
    if (f.size > 5 * 1024 * 1024) {
      return showToast("La imagen no debe superar 5 MB.", "error")
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleStockSave(product: Product, nextStock: number) {
    setSavingStock(product.id)

    try {
      const res = await fetch(`/api/products/${product.id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: nextStock }),
      })

      const payload = await res.json()

      if (!res.ok) {
        throw new Error(payload?.error || "No fue posible actualizar el stock.")
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, stock: payload.stock, is_available: payload.is_available }
            : item
        )
      )
      setStockInputs((current) => ({ ...current, [product.id]: String(payload.stock) }))
      showToast(
        payload.is_available
          ? `Stock actualizado para "${product.name}".`
          : `"${product.name}" quedó marcado como agotado.`,
        "success"
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible actualizar el stock."
      showToast(message, "error")
      setStockInputs((current) => ({ ...current, [product.id]: String(product.stock) }))
    } finally {
      setSavingStock(null)
    }
  }

  // US009.2 — Subir imagen
  async function handleUpload() {
    if (!file || !modal) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append("image", file)
      const res = await fetch(`/api/products/${modal.id}/image`, { method: "POST", body: form })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setProducts(ps => ps.map(p => p.id === modal.id ? { ...p, image_url: updated.image_url } : p))
      showToast("Imagen actualizada correctamente.", "success")
      closeModal()
    } catch {
      showToast("Error al subir la imagen. Intenta de nuevo.", "error")
    } finally {
      setUploading(false)
    }
  }

  // US009.3 — Eliminar imagen
  async function handleDelete(product: Product) {
    if (!confirm(`¿Eliminar la imagen de "${product.name}"?`)) return
    setDeleting(product.id)
    try {
      const res = await fetch(`/api/products/${product.id}/image`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setProducts(ps => ps.map(p => p.id === product.id ? { ...p, image_url: null } : p))
      showToast("Imagen eliminada.", "success")
    } catch {
      showToast("Error al eliminar la imagen.", "error")
    } finally {
      setDeleting(null)
    }
  }

  function closeModal() {
    setModal(null)
    setFile(null)
    setPreview(null)
  }

  const dataProducts = products.length ? products : sampleProducts;
  const filtered = dataProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <style>{styles}</style>
      <div className="adm-root">

        {/* Header */}
        <header className="adm-header">
          <div>
            <p className="adm-label">Panel de Administración</p>
            <h1 className="adm-title">Imágenes y <em>Disponibilidad</em></h1>
          </div>
          <span className="adm-count">{dataProducts.filter(p => p.is_available).length} / {dataProducts.length} disponibles</span>
        </header>

        {/* Search */}
        <div className="adm-search-wrap">
          <input
            className="adm-search"
            placeholder="Buscar platillo o categoría…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="adm-table-wrap">
          {loading ? (
            <div className="adm-loading">
              <div className="spinner" />
              Cargando platillos…
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Platillo</th>
                  <th>Precio</th>
                  <th>Estado imagen</th>
                  <th>Disponibilidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <td>
                      <div className="prod-cell">
                        <div className="thumb-wrap">
                          {p.image_url
                            ? <img className="thumb-img" src={p.image_url} alt={p.name} />
                            : <svg className="thumb-empty" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                          }
                        </div>
                        <div>
                          <div className="prod-name">{p.name}</div>
                          <div className="prod-category">{p.category_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="prod-price">${Number(p.base_price).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${p.image_url ? "has-img" : "no-img"}`}>
                        <span className="status-dot" />
                        {p.image_url ? "Con imagen" : "Sin imagen"}
                      </span>
                    </td>
                    <td className="stock-cell">
                      <span className={`status-badge ${p.is_available ? "available" : "sold-out"}`}>
                        <span className="status-dot" />
                        {p.is_available ? "Disponible" : "Agotado"}
                      </span>
                      <div className="stock-tools">
                        <input
                          className="stock-input"
                          type="number"
                          min={0}
                          step={1}
                          value={stockInputs[p.id] ?? String(p.stock)}
                          onChange={(e) =>
                            setStockInputs((current) => ({ ...current, [p.id]: e.target.value }))
                          }
                          disabled={savingStock === p.id}
                        />
                        <button
                          className="btn btn-stock"
                          onClick={() => handleStockSave(p, Number(stockInputs[p.id] ?? p.stock))}
                          disabled={
                            savingStock === p.id ||
                            stockInputs[p.id] === undefined ||
                            stockInputs[p.id] === "" ||
                            Number(stockInputs[p.id]) < 0 ||
                            !Number.isInteger(Number(stockInputs[p.id]))
                          }
                        >
                          {savingStock === p.id ? "Guardando" : "Guardar stock"}
                        </button>
                        <button
                          className="btn btn-soldout"
                          onClick={() => handleStockSave(p, 0)}
                          disabled={savingStock === p.id || p.stock === 0}
                        >
                          Marcar agotado
                        </button>
                      </div>
                      <div className="stock-helper">
                        {p.is_available ? `Stock actual: ${p.stock}` : "Sin existencias para pedidos"}
                      </div>
                    </td>
                    <td className="actions-cell">
                      {/* US009.2 */}
                      <button
                        className="btn btn-upload"
                        onClick={() => setModal(p)}
                        disabled={deleting === p.id || savingStock === p.id}
                      >
                        {p.image_url ? "Cambiar" : "Subir"}
                      </button>
                      {/* US009.3 */}
                      {p.image_url && (
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(p)}
                          disabled={deleting === p.id || savingStock === p.id}
                        >
                          {deleting === p.id ? "…" : "Eliminar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Upload Modal — US009.2 */}
        {modal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="modal">
              <p className="modal-sub">{modal.category_name}</p>
              <h2 className="modal-title">{modal.name}</h2>

              {!preview ? (
                <div
                  className={`drop-zone ${dragging ? "dragging" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => {
                    e.preventDefault(); setDragging(false)
                    const f = e.dataTransfer.files[0]
                    if (f) handleFileSelect(f)
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
                  />
                  <div className="drop-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="drop-text">
                    <strong>Arrastra una imagen</strong> o haz clic para seleccionar<br/>
                    JPG, PNG o WEBP · Máx 5 MB
                  </p>
                </div>
              ) : (
                <div className="preview-wrap">
                  <img className="preview-img" src={preview} alt="preview" />
                  <button className="preview-remove" onClick={() => { setPreview(null); setFile(null) }}>✕</button>
                </div>
              )}

              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={closeModal}>Cancelar</button>
                <button
                  className="btn btn-confirm"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                >
                  {uploading ? "Subiendo…" : "Guardar imagen"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.type === "success" ? "✓" : "✕"} {toast.msg}
          </div>
        )}
      </div>
    </>
  )
}
