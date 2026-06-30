import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Products.css';

const API = 'http://localhost:8080/api/v1';

/* ── Stars ─────────────────────────────────────────── */
function Stars({ rating }) {
    return (
        <span>
      {[1,2,3,4,5].map(n => (
          <span key={n} style={{ color: n <= Math.round(rating) ? '#f59e0b' : 'rgba(255,255,255,.18)', fontSize:13 }}>★</span>
      ))}
    </span>
    );
}

/* ── Product Card ─────────────────────────────────── */
function ProductCard({ product }) {
    const price = parseFloat(product.price);
    const avgRating = product.avgRating || 0;
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const handleAdd = (e) => {
        e.preventDefault();   // không điều hướng sang trang chi tiết
        e.stopPropagation();
        addItem({
            id: product.id,
            title: product.name,
            artist: product.seller?.fullName || 'Artist',
            grad: 'linear-gradient(135deg,#a855f7,#6366f1)',
            type: 'Digital',
            imageUrl: product.imageUrl,
            price,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1300);
    };

    return (
        <Link to={`/artwork/${product.id}`} className="pc-card">
            <div className="pc-thumb">
                {product.imageUrl
                    ? <img src={product.imageUrl} alt={product.name} className="pc-img" />
                    : <div className="pc-img-placeholder">🎨</div>
                }
                <span className="pc-category">{product.category?.name || ''}</span>
                <button
                    className={`pc-add ${added ? 'added' : ''}`}
                    onClick={handleAdd}
                    title="Thêm vào giỏ"
                    aria-label="Thêm vào giỏ"
                >
                    {added ? '✓ Đã thêm' : '🛒 Thêm'}
                </button>
            </div>
            <div className="pc-info">
                <p className="pc-name">{product.name}</p>
                <p className="pc-artist">{product.seller?.fullName || ''}</p>
                <div className="pc-footer">
                    <div className="pc-rating">
                        {avgRating > 0 ? (
                            <>
                                <Stars rating={avgRating} />
                                <span className="pc-rating-val">{avgRating.toFixed(1)}</span>
                                <span className="pc-review-count">({product.reviewCount})</span>
                            </>
                        ) : (
                            <span className="pc-no-review">Chưa có đánh giá</span>
                        )}
                    </div>
                    <span className="pc-price">{price.toLocaleString('vi-VN')}₫</span>
                </div>
            </div>
        </Link>
    );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function Products() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { count } = useCart();

    // Params from URL
    const initCategory = searchParams.get('category') || '';
    const initPage     = parseInt(searchParams.get('page') || '1', 10);
    const initSort     = searchParams.get('sort') || 'newest';

    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalElements: 0 });
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');

    const [categoryId, setCategoryId] = useState(initCategory);
    const [page, setPage]             = useState(initPage);
    const [sort, setSort]             = useState(initSort);

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');

    /* ── Fetch categories ────────────────────────── */
    useEffect(() => {
        fetch(`${API}/categories`)
            .then(r => r.json())
            .then(res => { if (res.status === 'success') setCategories(res.data || []); })
            .catch(() => {});
    }, []);

    /* ── Fetch products ──────────────────────────── */
    const fetchProducts = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams({ page, size: 12, sort });
        if (categoryId) params.set('categoryId', categoryId);

        fetch(`${API}/products?${params}`)
            .then(r => r.json())
            .then(res => {
                if (res.status === 'success') {
                    setProducts(res.data.products || []);
                    setPagination({
                        currentPage:   res.data.pagination.currentPage,
                        totalPages:    res.data.pagination.totalPages,
                        totalElements: res.data.pagination.totalElements,
                    });
                } else {
                    setError('Không thể tải sản phẩm.');
                }
            })
            .catch(() => setError('Lỗi kết nối máy chủ.'))
            .finally(() => setLoading(false));
    }, [categoryId, page, sort]);

    useEffect(() => {
        fetchProducts();
        // Sync URL params
        const p = {};
        if (categoryId) p.category = categoryId;
        if (page > 1)   p.page = page;
        if (sort !== 'newest') p.sort = sort;
        setSearchParams(p, { replace: true });
    }, [fetchProducts]); // eslint-disable-line

    const handleCategory = (cid) => { setCategoryId(cid); setPage(1); };
    const handleSort     = (s)   => { setSort(s); setPage(1); };

    const SORT_OPTIONS = [
        { value: 'newest',    label: 'Mới nhất' },
        { value: 'popular',   label: 'Phổ biến nhất' },
        { value: 'price_asc', label: 'Giá tăng dần' },
        { value: 'price_desc',label: 'Giá giảm dần' },
    ];

    const activeCategoryName = categories.find(c => String(c.id) === String(categoryId))?.name;

    return (
        <div className="products-page">

            {/* ── NAVBAR ── */}
            <nav className="prd-nav">
                <span className="nav-logo">🎨 </span>
                <Link to="/" className="prd-nav-logo"> <span>GenZArtist</span></Link>
                <div className="prd-nav-center">
                </div>
                <div className="prd-nav-right">
                    <Link to="/cart" className="prd-nav-cart">
                        🛒{count > 0 && <span className="prd-cart-badge">{count}</span>}
                    </Link>
                    {user ? (
                        <Link to="/profile" className="prd-nav-btn outline">{user.fullName}</Link>
                    ) : (
                        <>
                            <Link to="/login"    className="prd-nav-btn outline">Đăng nhập</Link>
                            <Link to="/register" className="prd-nav-btn solid">Tham gia miễn phí</Link>
                        </>
                    )}
                </div>
            </nav>

            <div className="prd-layout">

                {/* ── SIDEBAR FILTER ── */}
                <aside className="prd-sidebar">
                    <div className="filter-card">
                        <h3 className="filter-title">🗂️ Danh mục</h3>
                        <button
                            className={`filter-cat-btn ${!categoryId ? 'active' : ''}`}
                            onClick={() => handleCategory('')}
                        >
                            Tất cả
                            <span className="filter-cat-count">{pagination.totalElements}</span>
                        </button>
                        {categories.map(c => (
                            <button
                                key={c.id}
                                className={`filter-cat-btn ${String(categoryId) === String(c.id) ? 'active' : ''}`}
                                onClick={() => handleCategory(c.id)}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="filter-card">
                        <h3 className="filter-title">⚙️ Sắp xếp theo</h3>
                        {SORT_OPTIONS.map(o => (
                            <button
                                key={o.value}
                                className={`filter-sort-btn ${sort === o.value ? 'active' : ''}`}
                                onClick={() => handleSort(o.value)}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>

                    <button
                        className="prd-custom-order-btn"
                        onClick={() => navigate('/custom-order')}
                    >
                        ✏️ Đặt đơn vẽ theo yêu cầu
                    </button>
                </aside>

                {/* ── MAIN GRID ── */}
                <main className="prd-main">
                    {/* header */}
                    <div className="prd-main-header">
                        <div>
                            <h2 className="prd-main-title">
                                {activeCategoryName || 'Tất cả Artworks'}
                            </h2>
                            <p className="prd-main-sub">
                                {pagination.totalElements?.toLocaleString()} tác phẩm
                            </p>
                        </div>
                        {/* mobile sort */}
                        <select
                            className="prd-sort-select"
                            value={sort}
                            onChange={e => handleSort(e.target.value)}
                        >
                            {SORT_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* grid */}
                    {loading ? (
                        <div className="prd-loading">
                            <div className="prd-spinner"></div>
                            <p>Đang tải artwork…</p>
                        </div>
                    ) : error ? (
                        <div className="prd-error"><p>{error}</p></div>
                    ) : products.length === 0 ? (
                        <div className="prd-empty">
                            <p>😶 Không tìm thấy tác phẩm nào.</p>
                            <button onClick={() => handleCategory('')} className="prd-reset-btn">Xem tất cả</button>
                        </div>
                    ) : (
                        <div className="prd-grid">
                            {products.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    )}

                    {/* pagination */}
                    {!loading && pagination.totalPages > 1 && (
                        <div className="prd-pagination">
                            <button
                                className="prd-page-btn"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                            >← Trước</button>

                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(n => n === 1 || n === pagination.totalPages || Math.abs(n - page) <= 2)
                                .reduce((acc, n, i, arr) => {
                                    if (i > 0 && n - arr[i-1] > 1) acc.push('...');
                                    acc.push(n);
                                    return acc;
                                }, [])
                                .map((n, i) => n === '...'
                                    ? <span key={`e${i}`} className="prd-page-ellipsis">…</span>
                                    : (
                                        <button
                                            key={n}
                                            className={`prd-page-num ${page === n ? 'active' : ''}`}
                                            onClick={() => setPage(n)}
                                        >{n}</button>
                                    )
                                )
                            }

                            <button
                                className="prd-page-btn"
                                disabled={page >= pagination.totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >Tiếp →</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
