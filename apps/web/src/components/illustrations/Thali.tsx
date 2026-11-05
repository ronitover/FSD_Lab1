/**
 * A thali seen from above: katoris of dal, sabzi, raita and curry, rice, rotis and pickle, with steam.
 * Decorative, so it is hidden from screen readers. Drawn as plain shapes to stay light and themeable.
 */
export function ThaliIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 -70 320 400" className={className} aria-hidden="true">
      {/* Steam */}
      <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.85">
        <path d="M128 2c-9-11 9-20 0-31s9-20 0-31" className="motion-safe:animate-steam" />
        <path
          d="M160 -6c-9-11 9-20 0-31s9-20 0-31"
          className="motion-safe:animate-steam [animation-delay:-1s]"
        />
        <path
          d="M192 2c-9-11 9-20 0-31s9-20 0-31"
          className="motion-safe:animate-steam [animation-delay:-2s]"
        />
      </g>

      {/* Plate */}
      <circle cx="160" cy="160" r="150" fill="#000" opacity="0.12" transform="translate(6 10)" />
      <circle cx="160" cy="160" r="150" fill="#f4f1ea" />
      <circle cx="160" cy="160" r="150" fill="none" stroke="#d6cfc1" strokeWidth="3" />
      <circle cx="160" cy="160" r="126" fill="#fbfaf6" stroke="#e7e1d4" strokeWidth="2" />

      {/* Katoris: dal, sabzi, raita, curry */}
      {[
        { x: 86, y: 118, food: '#e7b23c', top: '#f2c95e' },
        { x: 131, y: 80, food: '#6f8f2f', top: '#86a83e' },
        { x: 189, y: 80, food: '#fffaf0', top: '#ffffff' },
        { x: 234, y: 118, food: '#b44a24', top: '#c9602f' },
      ].map((bowl) => (
        <g key={bowl.x}>
          <circle cx={bowl.x} cy={bowl.y} r="28" fill="#dcd6cb" />
          <circle cx={bowl.x} cy={bowl.y} r="28" fill="none" stroke="#c4bcad" strokeWidth="2" />
          <circle cx={bowl.x} cy={bowl.y} r="22" fill={bowl.food} />
          <ellipse cx={bowl.x - 6} cy={bowl.y - 7} rx="9" ry="5" fill={bowl.top} opacity="0.8" />
        </g>
      ))}
      {/* Coriander on the raita, cumin on the dal */}
      <g fill="#5b8a2e">
        <circle cx="183" cy="76" r="2.5" />
        <circle cx="195" cy="85" r="2" />
        <circle cx="188" cy="90" r="2.2" />
      </g>
      <g fill="#7a4b14">
        <circle cx="80" cy="122" r="1.8" />
        <circle cx="92" cy="114" r="1.6" />
        <circle cx="90" cy="126" r="1.6" />
      </g>

      {/* Rice */}
      <ellipse cx="122" cy="200" rx="46" ry="36" fill="#ffffff" stroke="#ebe4d6" strokeWidth="2" />
      <g stroke="#e3dbc9" strokeWidth="3" strokeLinecap="round">
        <path d="M100 190l6-3M118 182l7 2M137 192l6-4M108 208l6 2M128 212l7-2M146 204l5 3M115 196l6-1" />
      </g>

      {/* Rotis */}
      <circle cx="218" cy="190" r="38" fill="#c98b4c" />
      <circle cx="202" cy="210" r="38" fill="#dda969" stroke="#c48a4a" strokeWidth="2" />
      <g fill="#b9793d" opacity="0.7">
        <ellipse cx="190" cy="200" rx="5" ry="3" />
        <ellipse cx="212" cy="216" rx="6" ry="3.5" />
        <ellipse cx="198" cy="226" rx="4" ry="2.5" />
        <ellipse cx="216" cy="198" rx="3.5" ry="2.2" />
      </g>

      {/* Pickle and onion */}
      <circle cx="160" cy="258" r="11" fill="#d9542b" />
      <circle cx="157" cy="255" r="4" fill="#ef8a5c" />
      <circle cx="112" cy="250" r="12" fill="none" stroke="#c46f97" strokeWidth="4" />
      <circle cx="112" cy="250" r="6" fill="none" stroke="#d99ab8" strokeWidth="2.5" />
      <path d="M200 262c8-14 22-16 30-10-6 8-18 14-30 10z" fill="#9cc14a" />
    </svg>
  );
}
