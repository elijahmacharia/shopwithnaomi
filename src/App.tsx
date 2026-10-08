import { useEffect, useMemo, useState } from "react";
import { addToCart, cartCount, cartTotal, loadCart, saveCart, setQuantity, type CartLine } from "./cart";
import { findProduct, formatPrice, products } from "./products";

type View = { name: "shop" } | { name: "product"; id: string } | { name: "bag" };

export function App() {
  const [lines, setLines] = useState<CartLine[]>(() => loadCart());
  const [view, setView] = useState<View>({ name: "shop" });
  const count = cartCount(lines);

  useEffect(() => {
    saveCart(lines);
  }, [lines]);

  const total = useMemo(
    () => cartTotal(lines, (id) => findProduct(id)?.priceCents ?? 0),
    [lines],
  );

  return (
    <div className="page">
      <header className="top">
        <button className="brand" type="button" onClick={() => setView({ name: "shop" })}>
          Shop With Naomi
        </button>
        <button className="bag-link" type="button" onClick={() => setView({ name: "bag" })}>
          Bag ({count})
        </button>
      </header>
      <main>
        {view.name === "shop" && <Catalog onOpen={(id) => setView({ name: "product", id })} />}
        {view.name === "product" && (
          <ProductView
            id={view.id}
            onAdd={(id) => setLines((current) => addToCart(current, id))}
            onBack={() => setView({ name: "shop" })}
          />
        )}
        {view.name === "bag" && (
          <BagView
            lines={lines}
            total={total}
            onQuantity={(id, quantity) => setLines((current) => setQuantity(current, id, quantity))}
            onShop={() => setView({ name: "shop" })}
          />
        )}
      </main>
    </div>
  );
}

function Catalog({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <section>
      <p className="intro">Small goods for the table and the walk home.</p>
      <ul className="grid">
        {products.map((product) => (
          <li key={product.id}>
            <article className="card">
              <Swatch color={product.swatch} label={product.name} />
              <h2>{product.name}</h2>
              <p>{product.blurb}</p>
              <p className="price">{formatPrice(product.priceCents)}</p>
              <button type="button" onClick={() => onOpen(product.id)}>
                View {product.name}
              </button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductView({
  id,
  onAdd,
  onBack,
}: {
  id: string;
  onAdd: (id: string) => void;
  onBack: () => void;
}) {
  const product = findProduct(id);
  if (!product) {
    return (
      <section className="panel">
        <h1>Item not found</h1>
        <button type="button" onClick={onBack}>
          Back to shop
        </button>
      </section>
    );
  }
  return (
    <section className="panel product">
      <Swatch color={product.swatch} label={product.name} />
      <div>
        <h1>{product.name}</h1>
        <p className="price">{formatPrice(product.priceCents)}</p>
        <p>{product.detail}</p>
        <div className="actions">
          <button type="button" onClick={() => onAdd(product.id)}>
            Add {product.name} to bag
          </button>
          <button type="button" className="ghost" onClick={onBack}>
            Back to shop
          </button>
        </div>
      </div>
    </section>
  );
}

function BagView({
  lines,
  total,
  onQuantity,
  onShop,
}: {
  lines: CartLine[];
  total: number;
  onQuantity: (id: string, quantity: number) => void;
  onShop: () => void;
}) {
  const visible = lines.flatMap((line) => {
    const product = findProduct(line.productId);
    return product ? [{ line, product }] : [];
  });

  if (visible.length === 0) {
    return (
      <section className="panel">
        <h1>Your bag is empty</h1>
        <p>Add something from the shop. This demo keeps the bag in this browser only.</p>
        <button type="button" onClick={onShop}>
          Back to shop
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      <h1>Your bag</h1>
      <ul className="bag-list">
        {visible.map(({ line, product }) => (
          <li key={product.id}>
            <div>
              <h2>{product.name}</h2>
              <p className="price">{formatPrice(product.priceCents)}</p>
            </div>
            <div className="qty">
              <button
                type="button"
                aria-label={`Decrease ${product.name}`}
                onClick={() => onQuantity(product.id, line.quantity - 1)}
              >
                −
              </button>
              <span aria-label={`${product.name} quantity`}>{line.quantity}</span>
              <button
                type="button"
                aria-label={`Increase ${product.name}`}
                onClick={() => onQuantity(product.id, line.quantity + 1)}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="total">
        Total <strong>{formatPrice(total)}</strong>
      </p>
      <p className="note">Checkout is not connected. Nothing is charged.</p>
      <button type="button" className="ghost" onClick={onShop}>
        Back to shop
      </button>
    </section>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return <div className="swatch" style={{ background: color }} role="img" aria-label={label} />;
}
