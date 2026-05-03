"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"; // 👈 Importa el router
import { PedidoEntity, CartItem, CartSummary, DeliveryAddress, AddressForm } from "@/models/entities";



const DEMO_CUSTOMER_ID = 1
const ORDER_REFRESH_MS = 10000

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "Preparando",
  READY: "Listo",
  DELIVERY_ASSIGNED: "RepartidorEntity asignado",
  ON_DELIVERY: "En camino",
  COMPLETED: "Completado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  CONFIRMED: "Confirmado",
}

const statusSteps: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 0,
  PREPARING: 0,
  READY: 0,
  DELIVERY_ASSIGNED: 1,
  ON_DELIVERY: 1,
  COMPLETED: 2,
  DELIVERED: 2,
}

const deliverySteps = ["Preparando", "En camino", "Entregado"]

const emptyAddressForm: AddressForm = {
  street: "",
  exteriorNumber: "",
  interiorNumber: "",
  neighborhood: "",
  city: "",
  state: "",
  postalCode: "",
  references: "",
}

const emptyCart: CartSummary = {
  id: 0,
  item_count: 0,
  total_quantity: 0,
  subtotal: 0,
  iva: 0,
  total_amount: 0,
  restaurant_name: null,
  items: [],
}

async function readJsonResponse(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error("El servidor devolvió una respuesta no válida")
  }
}

function getCustomerStatus(order: PedidoEntity) {
  return statusLabels[order.status] ?? order.status
}

function getEstimatedDeliveryText(order: PedidoEntity) {
  if (["COMPLETED", "DELIVERED"].includes(order.status)) {
    return "Entregado"
  }

  if (order.status === "CANCELLED") {
    return "Cancelado"
  }

  if (!order.estimated_delivery_at) {
    return "Calculando tiempo estimado"
  }

  const eta = new Date(order.estimated_delivery_at)
  if (Number.isNaN(eta.getTime())) {
    return "Calculando tiempo estimado"
  }

  const remainingMinutes = Math.ceil((eta.getTime() - Date.now()) / 60000)
  const etaTime = eta.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  if (remainingMinutes <= 0) {
    return `Llegada estimada: ${etaTime} (en cualquier momento)`
  }

  return `Llegada estimada: ${etaTime} (${remainingMinutes} min aprox.)`
}

function formatSyncTime(date: Date | null) {
  if (!date) {
    return "Sin actualizar"
  }

  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;700&display=swap');

  .orders-shell {
    min-height: 100vh;
    padding: 40px 24px 60px;
    background:
      radial-gradient(circle at top left, rgba(193, 122, 58, 0.14), transparent 22%),
      linear-gradient(180deg, #f6f1e8 0%, #efe5d6 100%);
    color: #231a13;
    font-family: 'DM Sans', sans-serif;
  }

  .orders-wrap {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    gap: 24px;
  }

  .hero-card, .section-card {
    background: rgba(255, 251, 245, 0.94);
    border: 1px solid rgba(111, 82, 56, 0.16);
    border-radius: 28px;
    box-shadow: 0 24px 70px rgba(65, 39, 19, 0.08);
  }

  .hero-card {
    padding: 28px;
    display: grid;
    gap: 18px;
  }

  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9b6333;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.8fr);
    gap: 18px;
    align-items: center;
  }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(34px, 4vw, 56px);
    line-height: 1;
    margin-bottom: 14px;
  }

  .hero-copy {
    max-width: 640px;
    color: #6a5543;
    line-height: 1.7;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .primary-btn, .ghost-btn, .qty-btn, .danger-btn {
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 700;
    transition: opacity 0.2s ease, transform 0.15s ease;
  }

  .primary-btn:hover, .ghost-btn:hover, .qty-btn:hover, .danger-btn:hover {
    transform: translateY(-1px);
  }

  .primary-btn {
    background: #bf6f2d;
    color: #fff8f0;
    padding: 12px 18px;
  }

  .ghost-btn {
    background: transparent;
    color: #7a532b;
    padding: 12px 18px;
    border: 1px solid rgba(122, 83, 43, 0.24);
  }

  .hero-summary {
    display: grid;
    gap: 12px;
    padding: 20px;
    border-radius: 24px;
    background: linear-gradient(180deg, #241911 0%, #392619 100%);
    color: #f6ede1;
  }

  .hero-summary strong {
    font-family: 'Playfair Display', serif;
    font-size: 42px;
    line-height: 1;
  }

  .hero-summary span {
    color: #d9c5ae;
    font-size: 14px;
  }

  .section-card {
    padding: 24px;
  }

  .section-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    margin-bottom: 18px;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    margin-bottom: 6px;
  }

  .section-subtitle {
    color: #6a5543;
  }

  .cart-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.75fr);
    gap: 20px;
  }

  .cart-list {
    display: grid;
    gap: 16px;
  }

  .cart-item {
    display: grid;
    grid-template-columns: 88px minmax(0, 1fr);
    gap: 16px;
    padding: 18px;
    border-radius: 22px;
    background: #fffdf9;
    border: 1px solid rgba(111, 82, 56, 0.12);
  }

  .cart-thumb {
    width: 88px;
    height: 88px;
    border-radius: 18px;
    overflow: hidden;
    background: linear-gradient(135deg, #d8c3aa 0%, #f2e7d8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7a532b;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .cart-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cart-info {
    display: grid;
    gap: 12px;
  }

  .item-meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  .item-category {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #9b6333;
    margin-bottom: 4px;
  }

  .item-name {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
  }

  .item-price {
    text-align: right;
    font-weight: 700;
    color: #3d2817;
  }

  .item-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .qty-control {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border-radius: 999px;
    border: 1px solid rgba(111, 82, 56, 0.18);
    padding: 6px;
    background: #fff7ee;
  }

  .qty-btn {
    width: 34px;
    height: 34px;
    background: #f2e3d0;
    color: #5a381d;
  }

  .qty-value {
    min-width: 24px;
    text-align: center;
    font-weight: 700;
  }

  .stock-note {
    color: #6a5543;
    font-size: 13px;
  }

  .danger-btn {
    background: #2b1d12;
    color: #f6ede1;
    padding: 10px 14px;
  }

  .cart-summary {
    display: grid;
    gap: 16px;
    align-self: start;
    position: sticky;
    top: 24px;
    padding: 22px;
    border-radius: 24px;
    background: #2b1d12;
    color: #f6ede1;
  }

  .summary-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    color: #d9c5ae;
  }

  .summary-total {
    padding-top: 14px;
    border-top: 1px solid rgba(246, 237, 225, 0.16);
    display: flex;
    justify-content: space-between;
    font-size: 20px;
    font-weight: 700;
  }

  .note-field {
    display: grid;
    gap: 8px;
  }

  .note-label {
    color: #f6ede1;
    font-size: 14px;
    font-weight: 700;
  }

  .note-input {
    min-height: 96px;
    resize: vertical;
    border: 1px solid rgba(246, 237, 225, 0.18);
    border-radius: 16px;
    padding: 12px;
    background: rgba(255, 253, 249, 0.08);
    color: #fff8f0;
    font: inherit;
    line-height: 1.5;
  }

  .note-input::placeholder {
    color: #bda890;
  }

  .note-input:focus {
    outline: 2px solid rgba(214, 165, 117, 0.5);
    outline-offset: 2px;
  }

  .note-counter {
    text-align: right;
    color: #d9c5ae;
    font-size: 12px;
  }

  .address-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: 20px;
    align-items: start;
  }

  .address-list {
    display: grid;
    gap: 12px;
  }

  .address-option {
    width: 100%;
    text-align: left;
    border: 1px solid rgba(111, 82, 56, 0.14);
    border-radius: 8px;
    padding: 14px;
    background: #fffdf9;
    color: #2b1d12;
    cursor: pointer;
  }

  .address-option.selected {
    border-color: #bf6f2d;
    box-shadow: 0 0 0 2px rgba(191, 111, 45, 0.16);
  }

  .address-option strong {
    display: block;
    margin-bottom: 4px;
  }

  .address-option span {
    display: block;
    color: #6a5543;
    line-height: 1.5;
  }

  .address-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 10px;
  }

  .address-form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    padding: 18px;
    border-radius: 8px;
    background: #fffdf9;
    border: 1px solid rgba(111, 82, 56, 0.12);
  }

  .form-field {
    display: grid;
    gap: 7px;
  }

  .form-field.full {
    grid-column: 1 / -1;
  }

  .form-field span {
    font-size: 13px;
    font-weight: 700;
    color: #5c391e;
  }

  .form-input, .form-textarea {
    width: 100%;
    border: 1px solid rgba(111, 82, 56, 0.18);
    border-radius: 8px;
    padding: 11px 12px;
    color: #231a13;
    background: #fffaf3;
    font: inherit;
  }

  .form-textarea {
    min-height: 86px;
    resize: vertical;
  }

  .form-input:focus, .form-textarea:focus {
    outline: 2px solid rgba(191, 111, 45, 0.24);
    outline-offset: 2px;
  }

  .primary-btn:disabled, .ghost-btn:disabled, .qty-btn:disabled, .danger-btn:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
  }

  .status-banner {
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
  }

  .status-banner.success {
    background: #e9f7ea;
    color: #24633a;
  }

  .status-banner.error {
    background: #fbe9e7;
    color: #8b342b;
  }

  .empty-state {
    padding: 36px;
    text-align: center;
    border-radius: 24px;
    background: #fffdf9;
    border: 1px dashed rgba(111, 82, 56, 0.26);
    color: #6a5543;
  }

  .orders-status-list {
    display: grid;
    gap: 14px;
    margin-bottom: 18px;
  }

  .order-status-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.55fr);
    gap: 16px;
    padding: 18px;
    border-radius: 8px;
    background: #fffdf9;
    border: 1px solid rgba(111, 82, 56, 0.12);
  }

  .order-status-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 14px;
  }

  .order-status-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
  }

  .order-status-meta {
    color: #6a5543;
    font-size: 14px;
    line-height: 1.5;
  }

  .order-status-pill {
    border-radius: 8px;
    padding: 7px 10px;
    background: #e9f7ea;
    color: #24633a;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .order-status-pill.cancelled {
    background: #fbe9e7;
    color: #8b342b;
  }

  .delivery-track {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .delivery-step {
    display: grid;
    gap: 6px;
    color: #8a7868;
    font-size: 13px;
    font-weight: 700;
  }

  .delivery-step::before {
    content: "";
    height: 6px;
    border-radius: 999px;
    background: #e7d9c8;
  }

  .delivery-step.done,
  .delivery-step.active {
    color: #3b281c;
  }

  .delivery-step.done::before,
  .delivery-step.active::before {
    background: #24633a;
  }

  .eta-box {
    display: grid;
    align-content: center;
    gap: 8px;
    padding: 14px;
    border-radius: 8px;
    background: #2b1d12;
    color: #f6ede1;
  }

  .eta-label {
    color: #d9c5ae;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .eta-text {
    font-size: 18px;
    font-weight: 800;
    line-height: 1.35;
  }

  .orders-table {
    width: 100%;
    border-collapse: collapse;
    overflow: hidden;
    border-radius: 20px;
    background: #fffdf9;
  }

  .orders-table th,
  .orders-table td {
    text-align: left;
    padding: 16px;
    border-bottom: 1px solid rgba(111, 82, 56, 0.1);
  }

  .orders-table th {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #7a532b;
  }

  .order-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .table-btn {
    border: 0;
    border-radius: 999px;
    padding: 8px 12px;
    cursor: pointer;
    background: #ede0cf;
    color: #5c391e;
    font-weight: 700;
  }

  @media (max-width: 900px) {
    .hero-grid, .cart-layout, .address-grid, .order-status-card {
      grid-template-columns: 1fr;
    }

    .cart-summary {
      position: static;
    }
  }

  @media (max-width: 640px) {
    .orders-shell {
      padding: 20px 14px 40px;
    }

    .hero-card, .section-card {
      border-radius: 22px;
      padding: 18px;
    }

    .cart-item {
      grid-template-columns: 1fr;
    }

    .item-meta, .item-controls, .section-head {
      flex-direction: column;
      align-items: flex-start;
    }

    .address-form {
      grid-template-columns: 1fr;
    }

    .orders-table, .orders-table thead, .orders-table tbody, .orders-table tr, .orders-table th, .orders-table td {
      display: block;
      width: 100%;
    }

    .orders-table thead {
      display: none;
    }

    .orders-table tr {
      padding: 12px 0;
    }

    .orders-table td {
      padding: 8px 0;
      border: 0;
    }
  }
`
export default function OrdersPage() {
  const [customerId, setCustomerId] = useState<number | null>(null);
  const router = useRouter(); // 👈 Inicializa el router
  const [orders, setOrders] = useState<PedidoEntity[]>([])
  const [cart, setCart] = useState<CartSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)
  const [orderNote, setOrderNote] = useState("")
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [lastOrdersSync, setLastOrdersSync] = useState<Date | null>(null)

  // Ref para guardar el estado anterior de cada pedido (status)
  const prevStatusRef = useRef<Map<number, string>>(new Map());
  // Ref para claves únicas de pedidos ya redirigidos
  const redirectedKeys = useRef<Set<string>>(new Set());
  const getOrderUniqueKey = (order: PedidoEntity) => `${order.id}|${order.created_at}`;

  useEffect(() => {
    const savedId = sessionStorage.getItem('userId');
    if (savedId) {
      setCustomerId(parseInt(savedId));
    } else {
      // Opcional: Redirigir al login si no hay ID
      router.push('/login');
    }
  }, []);


  const loadData = useCallback(async (options?: { showLoading?: boolean; preserveMessage?: boolean }) => {
    if (!customerId) {
      return;
    }
    const showLoading = options?.showLoading ?? true
    if (showLoading) {
      setLoading(true)
    }
    if (!options?.preserveMessage) {
      setMessage(null)
    }
    try {
      const [ordersRes, cartRes, addressesRes] = await Promise.all([
        fetch(`/api/orders?customerId=${customerId}`),
        fetch(`/api/cart?customerId=${customerId}`),
        fetch(`/api/delivery-addresses?customerId=${customerId}`),
      ])

      const ordersData = await readJsonResponse(ordersRes)
      const cartData = await readJsonResponse(cartRes)
      const addressesData = await readJsonResponse(addressesRes)

      if (!ordersRes.ok) {
        throw new Error(ordersData?.error || "No se pudieron cargar los pedidos")
      }

      if (!cartRes.ok) {
        throw new Error(cartData?.error || "No se pudo cargar el carrito")
      }

      if (!addressesRes.ok) {
        throw new Error(addressesData?.error || "No se pudieron cargar las direcciones")
      }

      setOrders(Array.isArray(ordersData) ? ordersData : [])
      setLastOrdersSync(new Date())
      setCart((cartData || emptyCart) as CartSummary)
      const nextAddresses = Array.isArray(addressesData) ? addressesData : []
      setAddresses(nextAddresses)
      setSelectedAddressId((current) => current ?? nextAddresses[0]?.id ?? null)
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo cargar la información"
      setMessage({ type: "error", text })
      if (showLoading) {
        setOrders([])
        setCart(emptyCart)
        setAddresses([])
      }
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [customerId])

  // Efecto para inicializar prevStatusRef cuando se cargan los pedidos inicialmente
  useEffect(() => {
    if (orders.length === 0) return;
    const newPrevMap = new Map<number, string>();
    orders.forEach(order => {
      newPrevMap.set(order.id, order.status);
    });
    prevStatusRef.current = newPrevMap;
  }, [orders]); // Se ejecuta cada vez que orders cambia completamente

  // Efecto para el polling y detección de cambios de estado
  useEffect(() => {
    if (!customerId) return; // No iniciar polling sin ID
    const checkForStatusChanges = async () => {
      try {
        const res = await fetch(`/api/orders?customerId=${customerId}`);
        const newOrders = await readJsonResponse(res);
        if (!res.ok) throw new Error(newOrders?.error);

        const newOrdersArray = Array.isArray(newOrders) ? newOrders : [];

        // Detectar cambios
        for (const newOrder of newOrdersArray) {
          const prevStatus = prevStatusRef.current.get(newOrder.id);
          const currentStatus = newOrder.status;
          const uniqueKey = getOrderUniqueKey(newOrder);

          // ✅ Solo cuando cambia a 'CONFIRMED'
          const isConfirmedStatus = currentStatus === 'CONFIRMED';
          
          if (prevStatus && prevStatus !== currentStatus && isConfirmedStatus && !redirectedKeys.current.has(uniqueKey)) {
            // Marcar como redirigido
            redirectedKeys.current.add(uniqueKey);
            sessionStorage.setItem("confirmedRedirectedKeys", JSON.stringify(Array.from(redirectedKeys.current)));
            // Redirigir
            router.push("/cliente/confirmacion");
            break; // Solo una redirección por ciclo
          }
        }

        // Actualizar el mapa de estados anteriores
        const updatedPrevMap = new Map<number, string>();
        newOrdersArray.forEach(order => {
          updatedPrevMap.set(order.id, order.status);
        });
        prevStatusRef.current = updatedPrevMap;

        // Actualizar el estado de orders
        setOrders(newOrdersArray);
        setLastOrdersSync(new Date());
      } catch (err) {
        console.error("Error en polling de pedidos:", err);
      }
    };

    checkForStatusChanges();
    const intervalId = setInterval(checkForStatusChanges, ORDER_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [router, customerId],); 

  useEffect(() => {
    loadData()
    const intervalId = window.setInterval(() => {
      loadData({ showLoading: false, preserveMessage: true })
    }, ORDER_REFRESH_MS)

    return () => window.clearInterval(intervalId)
  }, [loadData])

  const syncCart = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options)
    const data = await readJsonResponse(response)

    if (!response.ok) {
      throw new Error(data?.error || "No se pudo actualizar el carrito")
    }

    setCart((data || emptyCart) as CartSummary)
  }

  const changeQuantity = async (item: CartItem, nextQuantity: number) => {
    setPendingItemId(item.id)
    setMessage(null)
    try {
      await syncCart(`/api/cart/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId,
          quantity: nextQuantity,
        }),
      })
      setMessage({ type: "success", text: "Carrito actualizado" })
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo actualizar el carrito"
      setMessage({ type: "error", text })
    } finally {
      setPendingItemId(null)
    }
  }

  const removeItem = async (itemId: number) => {
    setPendingItemId(itemId)
    setMessage(null)
    try {
      await syncCart(`/api/cart/items/${itemId}?customerId=${customerId}`, {
        method: "DELETE",
      })
      setMessage({ type: "success", text: "Producto eliminado del carrito" })
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo eliminar el producto"
      setMessage({ type: "error", text })
    } finally {
      setPendingItemId(null)
    }
  }

  const clearCurrentCart = async () => {
    setMessage(null)
    try {
      await syncCart(`/api/cart?customerId=${customerId}`, {
        method: "DELETE",
      })
      setMessage({ type: "success", text: "Carrito vaciado" })
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo vaciar el carrito"
      setMessage({ type: "error", text })
    }
  }

  const updateAddressField = (field: keyof AddressForm, value: string) => {
    setAddressForm((current) => ({ ...current, [field]: value }))
  }

  const startEditingAddress = (address: DeliveryAddress) => {
    setEditingAddressId(address.id)
    setAddressForm({
      street: address.street,
      exteriorNumber: address.exterior_number,
      interiorNumber: address.interior_number ?? "",
      neighborhood: address.neighborhood ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      references: address.references ?? "",
    })
  }

  const resetAddressForm = () => {
    setEditingAddressId(null)
    setAddressForm(emptyAddressForm)
  }

  const saveAddress = async () => {
    setIsSavingAddress(true)
    setMessage(null)
    try {
      const response = await fetch("/api/delivery-addresses", {
        method: editingAddressId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addressForm,
          id: editingAddressId,
          customerId: customerId,
        }),
      })

      const data = await readJsonResponse(response)
      if (!response.ok) {
        throw new Error(data?.error || "No se pudo guardar la dirección")
      }

      setSelectedAddressId(data.id)
      resetAddressForm()
      setMessage({ type: "success", text: "Dirección guardada y confirmada para tu pedido" })
      await loadData()
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo guardar la dirección"
      setMessage({ type: "error", text })
    } finally {
      setIsSavingAddress(false)
    }
  }

  // app/nuevo/OrdersPage.tsx (fragmento)

  const submitOrder = async () => {
    if (!cart || cart.item_count === 0 || isSubmittingOrder) return;
    if (!selectedAddressId) {
      setMessage({ type: "error", text: "Selecciona o registra una dirección de entrega antes de confirmar" });
      return;
    }

    setIsSubmittingOrder(true);
    setMessage(null);
    try {
      // 1. Crear pedido activo (descuenta stock, inserta en orders/order_items)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId,
          note: orderNote,
          deliveryAddressId: selectedAddressId,
        }),
      });

      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data?.error || "No se pudo confirmar el pedido");

      const newOrderId = data.id; // ID del pedido recién creado
      setMessage({ type: "success", text: `Pedido #${newOrderId} confirmado y enviado a cocina` });
      setOrderNote("");
      await loadData(); // recargar pedidos y carrito
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo confirmar el pedido";
      setMessage({ type: "error", text });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // app/nuevo/OrdersPage.tsx (fragmento)

  const cancelOrder = async (id: number) => {
    if (!confirm("¿Cancelar este pedido?")) return;

    setPendingItemId(id);   // o un estado de carga específico
    setMessage(null);

    try {
      /*// --- PRIMERA LLAMADA: Cancelar en orders (activo) ---
      const resOrders = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });

      if (!resOrders.ok) {
        const errorData = await resOrders.json();
        console.warn("Error al cancelar en orders:", errorData.error);
        // No lanzamos error todavía, continuamos con la segunda llamada
      }*/ 

      // --- SEGUNDA LLAMADA: Cancelar en historial (con reversión de stock y limpieza) ---
      const resHistorial = await fetch(`/api/pedidos/${id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const dataHistorial = await resHistorial.json();

      if (!resHistorial.ok) {
        throw new Error(dataHistorial.error || "Error al cancelar el pedido en el historial");
      }

      // Actualizar el estado local de pedidos
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === id
            ? { ...order, status: "CANCELLED", is_active: false, active_status: null }
            : order
        )
      );

      setMessage({ type: "success", text: `PedidoEntity #${id} cancelado correctamente` });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setPendingItemId(null);
    }
  };

  const assignDeliveryman = async (id: number) => {
    const res = await fetch("/api/orders/assign-deliveryman", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id }),
    })

    const data = await res.json()
    if (data.success) {
      alert("RepartidorEntity asignado: " + (data.deliveryman?.full_name || ""))
      loadData()
      return
    }

    alert(data.error || "No se pudo asignar repartidor")
  }

  return (
    <>
    <p>customerId: {customerId}</p>
      <style>{pageStyles}</style>
      <div className="orders-shell">
        <div className="orders-wrap">
          <section className="hero-card">
            <div className="eyebrow">US002 · Gestión de pedidos</div>
            <div className="hero-grid">
              <div>
                <h1 className="hero-title">Carrito de compras persistente</h1>
                <p className="hero-copy">
                  Revisa tus productos seleccionados, ajusta cantidades y confirma el monto total antes de continuar con el pedido.
                </p>
                <div className="hero-actions">
                  <a className="primary-btn" href="/cliente/menu">Seguir comprando</a>
                  <button className="ghost-btn" onClick={clearCurrentCart} disabled={!cart || cart.item_count === 0}>
                    Vaciar carrito
                  </button>
                </div>
              </div>

              <aside className="hero-summary">
                <div className="eyebrow" style={{ color: "#d6a575" }}>Resumen actual</div>
                <strong>${Number(cart?.total_amount ?? 0).toFixed(2)}</strong>
                <span>{cart?.total_quantity ?? 0} productos seleccionados</span>
                <span>{cart?.restaurant_name ? `Restaurante: ${cart.restaurant_name}` : "Aún no has agregado productos"}</span>
              </aside>
            </div>
          </section>

          <section className="section-card">
            <div className="section-head">
              <div>
                <h2 className="section-title">Dirección de entrega</h2>
                <p className="section-subtitle">Registra una dirección nueva, edita una existente y confirma el destino antes de enviar el pedido.</p>
              </div>
              <button className="ghost-btn" onClick={resetAddressForm}>
                Nueva dirección
              </button>
            </div>

            <div className="address-grid">
              <div className="address-list">
                {addresses.length === 0 ? (
                  <div className="empty-state">
                    <p style={{ fontSize: "20px", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Sin direcciones guardadas</p>
                    <p>Completa los campos obligatorios para guardar y confirmar el destino de entrega.</p>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <article
                      key={address.id}
                      className={`address-option ${selectedAddressId === address.id ? "selected" : ""}`}
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <strong>
                        {address.street} #{address.exterior_number}
                        {address.interior_number ? ` Int. ${address.interior_number}` : ""}
                      </strong>
                      <span>
                        {[address.neighborhood, address.city, address.state].filter(Boolean).join(", ")}
                      </span>
                      <span>CP {address.postal_code}</span>
                      {address.references && <span>Ref. {address.references}</span>}
                      <div className="address-actions">
                        <button
                          className="table-btn"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedAddressId(address.id)
                          }}
                        >
                          Confirmar
                        </button>
                        <button
                          className="table-btn"
                          onClick={(event) => {
                            event.stopPropagation()
                            startEditingAddress(address)
                          }}
                        >
                          Editar
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <div className="address-form">
                <label className="form-field full">
                  <span>Calle *</span>
                  <input
                    className="form-input"
                    value={addressForm.street}
                    onChange={(event) => updateAddressField("street", event.target.value)}
                    placeholder="Av. Central"
                  />
                </label>

                <label className="form-field">
                  <span>Número *</span>
                  <input
                    className="form-input"
                    value={addressForm.exteriorNumber}
                    onChange={(event) => updateAddressField("exteriorNumber", event.target.value)}
                    placeholder="123"
                  />
                </label>

                <label className="form-field">
                  <span>Interior</span>
                  <input
                    className="form-input"
                    value={addressForm.interiorNumber}
                    onChange={(event) => updateAddressField("interiorNumber", event.target.value)}
                    placeholder="B"
                  />
                </label>

                <label className="form-field">
                  <span>Colonia</span>
                  <input
                    className="form-input"
                    value={addressForm.neighborhood}
                    onChange={(event) => updateAddressField("neighborhood", event.target.value)}
                    placeholder="Centro"
                  />
                </label>

                <label className="form-field">
                  <span>Código postal *</span>
                  <input
                    className="form-input"
                    inputMode="numeric"
                    maxLength={5}
                    value={addressForm.postalCode}
                    onChange={(event) => updateAddressField("postalCode", event.target.value)}
                    placeholder="12345"
                  />
                </label>

                <label className="form-field">
                  <span>Ciudad *</span>
                  <input
                    className="form-input"
                    value={addressForm.city}
                    onChange={(event) => updateAddressField("city", event.target.value)}
                    placeholder="Ciudad"
                  />
                </label>

                <label className="form-field">
                  <span>Estado *</span>
                  <input
                    className="form-input"
                    value={addressForm.state}
                    onChange={(event) => updateAddressField("state", event.target.value)}
                    placeholder="Oaxaca"
                  />
                </label>

                <label className="form-field full">
                  <span>Referencias</span>
                  <textarea
                    className="form-textarea"
                    value={addressForm.references}
                    onChange={(event) => updateAddressField("references", event.target.value)}
                    placeholder="Casa color blanco, frente a la farmacia"
                  />
                </label>

                <div className="address-actions">
                  <button className="primary-btn" onClick={saveAddress} disabled={isSavingAddress}>
                    {isSavingAddress ? "Guardando..." : editingAddressId ? "Guardar cambios" : "Guardar y confirmar dirección"}
                  </button>
                  {editingAddressId && (
                    <button className="ghost-btn" onClick={resetAddressForm} disabled={isSavingAddress}>
                      Cancelar edición
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="section-card">
            <div className="section-head">
              <div>
                <h2 className="section-title">Tu carrito</h2>
                <p className="section-subtitle">Los cambios se guardan en la base de datos para conservar el carrito entre sesiones.</p>
              </div>
            </div>

            {message && <div className={`status-banner ${message.type}`}>{message.text}</div>}

            {loading ? (
              <p className="section-subtitle">Cargando carrito…</p>
            ) : !cart || cart.items.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: "22px", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Tu carrito está vacío</p>
                <p>Explora el menú y agrega productos para revisar el total antes de confirmar tu pedido.</p>
              </div>
            ) : (
              <div className="cart-layout">
                <div className="cart-list">
                  {cart.items.map((item) => (
                    <article key={item.id} className="cart-item">
                      <div className="cart-thumb">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.product_name} width={176} height={176} />
                        ) : (
                          "Sin imagen"
                        )}
                      </div>

                      <div className="cart-info">
                        <div className="item-meta">
                          <div>
                            <div className="item-category">{item.category_name}</div>
                            <h3 className="item-name">{item.product_name}</h3>
                          </div>
                          <div className="item-price">
                            <div>${Number(item.subtotal).toFixed(2)}</div>
                            <div style={{ color: "#7a532b", fontSize: 13 }}>${Number(item.unit_price).toFixed(2)} c/u</div>
                          </div>
                        </div>

                        <div className="item-controls">
                          <div>
                            <div className="qty-control">
                              <button
                                className="qty-btn"
                                onClick={() => changeQuantity(item, item.quantity - 1)}
                                disabled={pendingItemId === item.id}
                              >
                                -
                              </button>
                              <span className="qty-value">{item.quantity}</span>
                              <button
                                className="qty-btn"
                                onClick={() => changeQuantity(item, item.quantity + 1)}
                                disabled={pendingItemId === item.id || item.quantity >= item.available_stock}
                              >
                                +
                              </button>
                            </div>
                            <div className="stock-note">Stock disponible: {item.available_stock}</div>
                          </div>

                          <button
                            className="danger-btn"
                            onClick={() => removeItem(item.id)}
                            disabled={pendingItemId === item.id}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <aside className="cart-summary">
                  <div className="summary-title">Resumen</div>
                  <div className="summary-row">
                    <span>Productos distintos</span>
                    <strong>{cart.item_count}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Unidades totales</span>
                    <strong>{cart.total_quantity}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Restaurante</span>
                    <strong>{cart.restaurant_name ?? "Pendiente"}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Entrega</span>
                    <strong>{selectedAddressId ? "Confirmada" : "Pendiente"}</strong>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <strong>${Number(cart.total_amount).toFixed(2)}</strong>
                  </div>

                  <label className="note-field">
                    <span className="note-label">Nota especial para cocina</span>
                    <textarea
                      className="note-input"
                      maxLength={200}
                      value={orderNote}
                      onChange={(event) => setOrderNote(event.target.value)}
                      placeholder="Ej. sin cebolla, extra picante, salsa aparte"
                    />
                    <span className="note-counter">{orderNote.length}/200 caracteres</span>
                  </label>

                  <button
                    className="primary-btn"
                    onClick={submitOrder}
                    disabled={isSubmittingOrder || cart.item_count === 0 || !selectedAddressId}
                  >
                    {isSubmittingOrder ? "Confirmando..." : "Confirmar pedido"}
                  </button>
                </aside>
              </div>
            )}
          </section>

          <section className="section-card">
            <div className="section-head">
              <div>
                <h2 className="section-title">Mis pedidos</h2>
                <p className="section-subtitle">
                  Estado actual, avance de entrega y tiempo estimado. Actualizado cada {ORDER_REFRESH_MS / 1000} segundos.
                </p>
                <p className="section-subtitle">Última actualización: {formatSyncTime(lastOrdersSync)}</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: "22px", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Aún no tienes pedidos</p>
                <p>Cuando confirmes un pedido, podrás seguir aquí su preparación, salida a reparto y entrega.</p>
              </div>
            ) : (
              <>
                <div className="orders-status-list">
                  {orders.map((order) => {
                    const currentStep = statusSteps[order.status] ?? -1
                    const isCancelled = order.status === "CANCELLED"

                    return (
                      <article className="order-status-card" key={order.id}>
                        <div>
                          <div className="order-status-head">
                            <div>
                              <h3 className="order-status-title">PedidoEntity #{order.id}</h3>
                              <p className="order-status-meta">
                                Total ${Number(order.total_amount).toFixed(2)} · {order.note || "Sin nota especial"}
                              </p>
                              <p className="order-status-meta">
                                RepartidorEntity: {order.deliveryman_name ?? "Pendiente de asignación"}
                              </p>
                            </div>
                            <span className={`order-status-pill ${isCancelled ? "cancelled" : ""}`}>
                              {getCustomerStatus(order)}
                            </span>
                          </div>

                          <div className="delivery-track" aria-label={`Estado actual: ${getCustomerStatus(order)}`}>
                            {deliverySteps.map((step, index) => (
                              <span
                                className={`delivery-step ${currentStep > index ? "done" : ""} ${currentStep === index ? "active" : ""}`}
                                key={`${order.id}-${step}`}
                              >
                                {step}
                              </span>
                            ))}
                          </div>
                        </div>

                        <aside className="eta-box">
                          <span className="eta-label">Tiempo estimado</span>
                          <span className="eta-text">{getEstimatedDeliveryText(order)}</span>
                        </aside>
                      </article>
                    )
                  })}
                </div>

                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Nota</th>
                      <th>Total</th>
                      <th>RepartidorEntity</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td style={{ fontSize: '13px' }}>
                          {new Date(order.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>
                        <td>{getCustomerStatus(order)}</td>
                        <td>{order.note || "Sin nota"}</td>
                        <td>${Number(order.total_amount).toFixed(2)}</td>
                        <td>{order.deliveryman_name ?? "Sin asignar"}</td>
                        <td>
                          <div className="order-actions">
                            {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                              <button className="table-btn" onClick={() => cancelOrder(order.id)}>
                                Cancelar / Reembolsar
                              </button>
                            )}
                            {/* {order.status === "READY" && (
                              <button className="table-btn" onClick={() => assignDeliveryman(order.id)}>
                                Asignar repartidor
                              </button>
                            )} */
                            }
                            {["DELIVERY_ASSIGNED", "ON_DELIVERY"].includes(order.status) && (
                              <span style={{ color: "#24633a", fontWeight: 700 }}>RepartidorEntity asignado</span>
                            )}
                            {["COMPLETED", "DELIVERED"].includes(order.status) && (
                              <span style={{ color: "#24633a", fontWeight: 700 }}>Entregado</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
