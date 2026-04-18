// app/menu/[id]/reviews/page.tsx
// US016: Interfaz para que los clientes vean puntuaciones y comentarios de los platillos

"use client";

import { useEffect, useState, use } from "react";

interface Review {
  id: number;
  product_name: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ProductReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState("");

  // Form state for new review
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetch(`/api/reviews?productId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(Number(data.avg_rating) || 0);
        setTotalReviews(data.total_reviews || 0);
        if (data.reviews?.length > 0) {
          setProductName(data.reviews[0].product_name);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: parseInt(id),
          customer_id: 1, // default client user
          rating,
          comment,
        }),
      });
      if (res.ok) {
        setSubmitMsg("¡Gracias por tu reseña!");
        setComment("");
        setRating(5);
        // Refresh
        const data = await fetch(`/api/reviews?productId=${id}`).then((r) => r.json());
        setReviews(data.reviews || []);
        setAvgRating(Number(data.avg_rating) || 0);
        setTotalReviews(data.total_reviews || 0);
      } else {
        const err = await res.json();
        setSubmitMsg(err.error || "Error al enviar reseña");
      }
    } catch {
      setSubmitMsg("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .reviews-client {
          min-height: 100vh; background: #0a0a0a; color: #e5e5e5;
          font-family: 'Inter', sans-serif; padding: 0;
        }

        .reviews-hero {
          padding: 48px 32px 32px; border-bottom: 1px solid #1e1e1e;
          position: relative; overflow: hidden;
        }
        .reviews-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(211,84,0,0.08), transparent);
          pointer-events: none;
        }

        .reviews-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: #D35400; font-size: 13px; text-decoration: none;
          margin-bottom: 20px; font-weight: 500; transition: color 0.15s;
        }
        .reviews-back:hover { color: #E67E22; }

        .reviews-product-name {
          font-size: 28px; font-weight: 700; color: #fff;
          letter-spacing: -0.02em; margin: 0 0 12px;
        }

        .reviews-avg {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .reviews-avg-value { font-size: 48px; font-weight: 700; color: #D35400; }
        .reviews-avg-stars { font-size: 24px; color: #E67E22; }
        .reviews-avg-count { font-size: 13px; color: #555; }

        /* Star distribution */
        .star-dist { margin-top: 16px; }
        .star-row {
          display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 12px;
        }
        .star-row-label { width: 20px; color: #888; text-align: right; }
        .star-row-bar {
          flex: 1; height: 6px; background: #1a1a1a; border-radius: 3px; max-width: 200px; overflow: hidden;
        }
        .star-row-fill { height: 100%; background: #D35400; border-radius: 3px; transition: width 0.5s; }
        .star-row-count { width: 24px; color: #555; }

        /* Form */
        .review-form-section {
          padding: 32px; border-bottom: 1px solid #1e1e1e;
        }
        .review-form-title {
          font-size: 16px; font-weight: 600; color: #fff; margin: 0 0 16px;
        }

        .star-selector {
          display: flex; gap: 4px; margin-bottom: 16px;
        }
        .star-btn {
          background: none; border: none; font-size: 32px; cursor: pointer;
          padding: 0; transition: transform 0.15s;
        }
        .star-btn:hover { transform: scale(1.2); }

        .review-textarea {
          width: 100%; padding: 12px 16px; background: #111; border: 1px solid #2a2a2a;
          border-radius: 8px; color: #ccc; font-size: 14px; font-family: inherit;
          resize: vertical; min-height: 80px; outline: none; margin-bottom: 12px;
          box-sizing: border-box;
        }
        .review-textarea:focus { border-color: #D35400; }
        .review-textarea::placeholder { color: #444; }

        .review-submit {
          padding: 10px 24px; background: #D35400; color: #fff; border: none;
          border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
        }
        .review-submit:hover { background: #E67E22; }
        .review-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .review-msg {
          margin-top: 10px; font-size: 13px; padding: 8px 12px; border-radius: 6px;
        }
        .review-msg.success { background: rgba(46,204,113,0.1); color: #2ECC71; }
        .review-msg.error { background: rgba(231,76,60,0.1); color: #E74C3C; }

        /* Reviews List */
        .reviews-list-section { padding: 32px; }
        .reviews-list-title {
          font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;
          color: #555; margin-bottom: 16px; padding-bottom: 8px;
          border-bottom: 1px solid #1e1e1e;
        }

        .review-card {
          background: #111; border: 1px solid #1e1e1e; border-radius: 10px;
          padding: 20px; margin-bottom: 12px; transition: all 0.15s;
        }
        .review-card:hover { border-color: #252525; }

        .review-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .review-card-stars { color: #E67E22; font-size: 16px; }
        .review-card-date { font-size: 11px; color: #444; }
        .review-card-comment { font-size: 14px; color: #999; line-height: 1.6; margin-bottom: 8px; }
        .review-card-author { font-size: 12px; color: #555; display: flex; align-items: center; gap: 6px; }

        .reviews-empty {
          padding: 40px; text-align: center; color: #444; font-size: 14px;
          background: #111; border: 1px solid #1e1e1e; border-radius: 10px;
        }

        .reviews-loading { padding: 60px 20px; text-align: center; color: #555; }

        @media (max-width: 640px) {
          .reviews-hero, .review-form-section, .reviews-list-section { padding: 20px; }
          .reviews-product-name { font-size: 22px; }
          .reviews-avg-value { font-size: 36px; }
        }
      `}</style>

      <div className="reviews-client">
        {loading ? (
          <div className="reviews-loading">Cargando reseñas...</div>
        ) : (
          <>
            {/* Hero */}
            <div className="reviews-hero">
              <a href="/menu" className="reviews-back">
                ← Volver al Menú
              </a>
              <h1 className="reviews-product-name">
                {productName || `Producto #${id}`}
              </h1>
              <div className="reviews-avg">
                <span className="reviews-avg-value">{avgRating.toFixed(1)}</span>
                <div>
                  <div className="reviews-avg-stars">
                    {"★".repeat(Math.round(avgRating))}
                    {"☆".repeat(5 - Math.round(avgRating))}
                  </div>
                  <div className="reviews-avg-count">
                    {totalReviews} reseña{totalReviews !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Star distribution */}
              {totalReviews > 0 && (
                <div className="star-dist">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="star-row">
                        <span className="star-row-label">{star}★</span>
                        <div className="star-row-bar">
                          <div className="star-row-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="star-row-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Form */}
            <div className="review-form-section">
              <h2 className="review-form-title">Deja tu Reseña</h2>
              <form onSubmit={handleSubmit}>
                <div className="star-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="star-btn"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {star <= displayRating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
                <textarea
                  className="review-textarea"
                  placeholder="Escribe tu comentario (opcional)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                />
                <button
                  type="submit"
                  className="review-submit"
                  disabled={submitting}
                >
                  {submitting ? "Enviando..." : "Enviar Reseña"}
                </button>
                {submitMsg && (
                  <div
                    className={`review-msg ${submitMsg.includes("Gracias") ? "success" : "error"}`}
                  >
                    {submitMsg}
                  </div>
                )}
              </form>
            </div>

            {/* Reviews List */}
            <div className="reviews-list-section">
              <div className="reviews-list-title">
                Todas las Reseñas ({totalReviews})
              </div>
              {reviews.length === 0 ? (
                <div className="reviews-empty">
                  Aún no hay reseñas para este platillo. ¡Sé el primero!
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="review-card">
                    <div className="review-card-top">
                      <span className="review-card-stars">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </span>
                      <span className="review-card-date">
                        {new Date(r.created_at).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {r.comment && (
                      <div className="review-card-comment">{r.comment}</div>
                    )}
                    <div className="review-card-author">
                      👤 {r.customer_name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
