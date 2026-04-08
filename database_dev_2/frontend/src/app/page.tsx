import Link from "next/link";
import { ReadingRoomLogo } from "@/components/layout/ReadingRoomLogo";

const BG_TEXTURE = "/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCABdB2kDASIAAhEBAxEB/8QAGgABAQEBAQEBAAAAAAAAAAAAAAECBQQGCP/EACgQAQADAAMAAQQDAAIDAQAAAAABEVEhYZESAgWx8DRzgQOhFDNxwf/EABgBAQEBAQEAAAAAAAAAAAAAAAABAgQF/8QAGBEBAQADAAAAAAAAAAAAAAAAABEBBDL/2gAMAwEAAhEDEQA/APzDU5JU5KLTbyipyT4zkgB8ZyV+M5KAL8ZyfCpyUpRCpySpyQA+M5JU5IAvxnJKnJCgKnJKnJKAKnJPjOSoCfGclfjOSAFTklTkgBU5JU5IAVOSVOSoInxnJX4zkgKfGck+M5IAVOSVOSAFTklTkgItTkpU5KoC1OSVOShYLU5JU5KWchV+M5JU5KcgVakqUAq1PZzkoAVOSVOSAFfVklTkgBU5J8ZyQAqckqckAKnJKnJACpySpyQAqckqckAKnJWpyUAWpySpyUAWpySpyUssFqckqclLLBanJKnJSywWpySpyUssFqckqclLLBanJKnJSywWpySpyUssFqckqclLLBanJKnJSywWpySpyUssCpySpySywKnJKnJLLAqckqckssCpySpySywKnJPjOSWWBU5JU5KWoFfVklTkiWC1OSVOSllgtTklTkoAtTknxnJQFX4zknxnJQsF+M5KVOSWWBU5JU5JcFwBU5JU5JcAFTklT2IC/Gck+M5KWWC/GclPjOSWWBU5JU5JcFwBU5JU5IgLU5JU5KALU5KfGckssD4zknxnJLLgCvqySpyRAWpyfE+M5IAVOSVOSFilTklTkloC1OSVOSgC1OSVOSllgtTkpU5IWB8ZySpyQAqckqckQVanJKnJQsRanJKnJS+wFqckqclCwWpySpyUssFqckqclLLBanJKnJSywWpySpyUssFqckqclLLBanJKnJSywWpySpyUssFqckqclLLBanJKnJSywWpySpyUssFqckqclLLBanJKnJSywWpySpyUsBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQBanJKnJQB0PskzH/P8A8kVxP0f/ALDquT9k/k/X/XP5h1mcu7X4fOWKNOBKUAAWgQWlBClASlAAAAFEQUFRQAAEBUAAsAOTkKqAFLLWihKnJyoogoBRQAgKCCiCCgqCgVBQEUABLLBRAFQALAAAECwFAAAAAAAAAAAAAAEUCIKBEFAiCgRBQIgoEQAAAAAAAAAAABFAQVAAAAAAACgFKSlLBBbguAQXhACjg/0EopbLBBbg4BAAEC+wAsuAQXgFQVAAAC+wCgAUABBQVBUAACoKBUACgAUACgAUACgAUACgAUACgAUW0Aq2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";

export default function RootPage() {
  const bgDataUrl = `data:image/jpeg;base64,${BG_TEXTURE}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=IM+Fell+English:ital@0;1&family=Jost:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ══════════════════════════════════════════
           STAGE — full viewport, textured background
        ══════════════════════════════════════════ */
        .brr-stage {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-image: url("${bgDataUrl}");
          background-repeat: repeat;
          background-size: 100% auto;
          position: relative;
        }

        /* Dark vignette overlay so texture doesn't fight the content */
        .brr-stage::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse at 50% 0%,   #000000aa 0%, transparent 60%),
            radial-gradient(ellipse at 50% 100%, #000000cc 0%, transparent 55%),
            radial-gradient(ellipse at 0%   50%, #00000099 0%, transparent 50%),
            radial-gradient(ellipse at 100% 50%, #00000099 0%, transparent 50%),
            #09201c99;
          pointer-events: none;
          z-index: 0;
        }

        /* ══════════════════════════════════════════
           MASTHEAD — top golden banner
        ══════════════════════════════════════════ */
        .brr-masthead-bar {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 24px 32px;
          border-bottom: 1px solid #c9a24a44;
        }

        /* Subtle gold glow behind the title */
        .brr-masthead-bar::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 320px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #d4af50cc, transparent);
        }

        .brr-masthead-logo-row {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 14px;
        }

        .brr-shop-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(1.6rem, 4vw, 2.8rem);
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #f0d585;
          text-shadow:
            0 0 40px #c9a24a66,
            0 1px 2px #00000088;
          line-height: 1;
        }

        .brr-shop-tagline {
          font-family: 'Jost', sans-serif;
          font-size: 0.62rem;
          font-weight: 300;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: #b89a5a;
          margin-top: 8px;
        }

        /* Decorative rule beneath tagline */
        .brr-ornament-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
        }

        .brr-ornament-line {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c9a24a88);
        }

        .brr-ornament-line.flip {
          background: linear-gradient(90deg, #c9a24a88, transparent);
        }

        .brr-ornament-diamond {
          width: 5px;
          height: 5px;
          background: #c9a24a;
          transform: rotate(45deg);
          flex-shrink: 0;
        }

        .brr-ornament-dot {
          width: 3px;
          height: 3px;
          background: #c9a24a88;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ══════════════════════════════════════════
           BOOK WRAPPER
        ══════════════════════════════════════════ */
        .brr-book-wrap {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 940px;
          padding: 40px 24px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .brr-book {
          position: relative;
          width: 100%;
          display: flex;
          filter:
            drop-shadow(0 40px 80px #000000cc)
            drop-shadow(0 8px 20px #00000099)
            drop-shadow(0 2px 4px #000000aa);
        }

        /* Cast shadow on the "desk" below the book */
        .brr-book::after {
          content: '';
          position: absolute;
          bottom: -22px;
          left: 6%;
          right: 6%;
          height: 22px;
          background: radial-gradient(ellipse at 50% 0%, #00000088 0%, transparent 70%);
          pointer-events: none;
        }

        /* ══════════════════════════════════════════
           PAGES
        ══════════════════════════════════════════ */
        .brr-page {
          flex: 1;
          background: #fef8ec;
          padding: 48px 44px 52px;
          position: relative;
          min-height: 600px;
        }

        /* Left page: darkens slightly toward spine edge */
        .brr-page-left {
          border-radius: 3px 0 0 3px;
          background: linear-gradient(to right, #fef8ec 88%, #f0e5cc 100%);
          box-shadow:
            inset 6px 0 10px #0000000a,
            inset -6px 0 18px #0000001e;
        }

        /* Right page: mirror */
        .brr-page-right {
          border-radius: 0 3px 3px 0;
          background: linear-gradient(to left, #fef8ec 88%, #f0e5cc 100%);
          box-shadow:
            inset -6px 0 10px #0000000a,
            inset 6px 0 18px #0000001e;
        }

        /* Inset margin border — classic book flourish */
        .brr-page-left::before,
        .brr-page-right::before {
          content: '';
          position: absolute;
          inset: 20px;
          border: 0.5px solid #c8a84030;
          pointer-events: none;
        }

        /* Page number */
        .brr-page-left::after,
        .brr-page-right::after {
          content: attr(data-page);
          position: absolute;
          bottom: 20px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 11px;
          font-style: italic;
          color: #9a8870;
          letter-spacing: 0.12em;
        }
        .brr-page-left::after  { left: 44px; }
        .brr-page-right::after { right: 44px; }

        /* ══════════════════════════════════════════
           SPINE
        ══════════════════════════════════════════ */
        .brr-spine {
          width: 32px;
          flex-shrink: 0;
          background: linear-gradient(
            to right,
            #080f0e 0%,
            #0e2e28 20%,
            #1d5245 50%,
            #0e2e28 80%,
            #080f0e 100%
          );
          position: relative;
          box-shadow:
            -4px 0 14px #000000aa,
             4px 0 14px #000000aa;
        }

        /* Gold hairline rule on spine */
        .brr-spine::before {
          content: '';
          position: absolute;
          top: 20px;
          bottom: 20px;
          left: calc(50% - 0.5px);
          width: 1px;
          background: linear-gradient(
            to bottom,
            transparent,
            #d4af5099,
            #e8c96c,
            #d4af5099,
            transparent
          );
        }

        /* ══════════════════════════════════════════
           TYPOGRAPHY
        ══════════════════════════════════════════ */
        .brr-ornament {
          text-align: center;
          color: #b89044;
          font-size: 11px;
          letter-spacing: 0.5em;
          margin-bottom: 22px;
          opacity: 0.65;
          font-family: 'Cormorant Garamond', serif;
        }

        .brr-chapter-label {
          font-family: 'Jost', sans-serif;
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #9a7e52;
          margin-bottom: 10px;
        }

        .brr-display-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #112920;
          line-height: 1.12;
          letter-spacing: 0.015em;
        }

        .brr-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.75rem;
          font-style: italic;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: #7a6644;
          margin-top: 7px;
        }

        .brr-rule {
          border: none;
          border-top: 0.5px solid #c8a84044;
          margin: 20px 0;
        }

        .brr-section-label {
          font-family: 'Jost', sans-serif;
          font-size: 0.56rem;
          font-weight: 500;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #8a6e42;
          margin-bottom: 8px;
        }

        .brr-body {
          font-family: 'IM Fell English', Georgia, serif;
          font-size: 0.91rem;
          line-height: 1.82;
          color: #2a3d30;
        }

        /* Drop cap on first paragraph */
        .brr-drop-cap::first-letter {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 3.4rem;
          font-weight: 700;
          float: left;
          line-height: 0.7;
          margin: 8px 7px 0 0;
          color: #16453c;
        }

        /* ══════════════════════════════════════════
           RIGHT PAGE ELEMENTS
        ══════════════════════════════════════════ */
        .brr-book-masthead {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .brr-book-masthead-text {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #112920;
          line-height: 1.2;
        }

        .brr-book-masthead-sub {
          font-family: 'Jost', sans-serif;
          font-size: 0.56rem;
          font-weight: 300;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #8a7250;
          margin-top: 4px;
        }

        .brr-names-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 10px;
        }

        .brr-name-chip {
          font-family: 'Jost', sans-serif;
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 0.07em;
          color: #173b30;
          background: linear-gradient(135deg, #f3e7c6, #e9d6a2);
          border: 0.5px solid #c8a84060;
          border-radius: 2px;
          padding: 5px 12px;
        }

        .brr-enter-btn {
          display: inline-block;
          margin-top: 30px;
          font-family: 'Jost', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          color: #fef4dc;
          background: linear-gradient(160deg, #163e36, #1e5848);
          border: 1px solid #c9a24a77;
          border-radius: 3px;
          padding: 12px 28px;
          transition: all 0.24s ease;
          box-shadow:
            0 2px 16px #00000033,
            inset 0 1px 0 #ffffff0a;
        }

        .brr-enter-btn:hover {
          background: linear-gradient(160deg, #1d5247, #266e5c);
          border-color: #d4af50;
          box-shadow:
            0 6px 24px #00000044,
            0 0 0 1px #c9a24a33;
          transform: translateY(-2px);
          color: #fff8e7;
        }

        .brr-enter-btn:active {
          transform: translateY(0);
        }

        /* ══════════════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════════════ */
        @media (max-width: 680px) {
          .brr-book { flex-direction: column; }
          .brr-spine { width: 100%; height: 18px; }
          .brr-spine::before { top: 50%; bottom: auto; left: 20px; right: 20px; width: auto; height: 1px; transform: none; }
          .brr-page-left  { border-radius: 3px 3px 0 0; min-height: auto; }
          .brr-page-right { border-radius: 0 0 3px 3px; min-height: auto; }
          .brr-page { padding: 32px 28px 40px; }
          .brr-shop-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="brr-stage">

        {/* ══ GOLDEN MASTHEAD ══ */}
        <div className="brr-masthead-bar">
          <div className="brr-masthead-logo-row">
            <ReadingRoomLogo size={52} />
            <h1 className="brr-shop-title">Britannicus Reading Room</h1>
          </div>
          <p className="brr-shop-tagline">Rare Books &nbsp;&middot;&nbsp; Antique Maps &nbsp;&middot;&nbsp; Fine Editions</p>
          <div className="brr-ornament-row">
            <div className="brr-ornament-line" />
            <div className="brr-ornament-dot" />
            <div className="brr-ornament-diamond" />
            <div className="brr-ornament-dot" />
            <div className="brr-ornament-line flip" />
          </div>
        </div>

        {/* ══ OPEN BOOK ══ */}
        <div className="brr-book-wrap">
          <div className="brr-book">

            {/* LEFT PAGE */}
            <div className="brr-page brr-page-left" data-page="i">
              <div className="brr-ornament">&#x2014; &nbsp; &#x2014; &nbsp; &#x2014;</div>

              <div className="brr-chapter-label">The Britannicus Reading Room</div>
              <h2 className="brr-display-title">
                Rare Books,<br />Antique Maps<br />&amp; Fine Editions
              </h2>
              <p className="brr-tagline">Est. Connor Whyte &mdash; Inventory &amp; Sales System</p>

              <hr className="brr-rule" />

              <div className="brr-section-label">The Problem</div>
              <p className="brr-body brr-drop-cap" style={{ marginBottom: 20 }}>
                Connor&rsquo;s shop handles rare books, antique maps, and
                periodicals across a growing network of dealers, collectors,
                and estate sources. As acquisitions and pricing research
                intensify, managing inventory, provenance, and market prices
                by hand has become untenable.
              </p>

              <div className="brr-section-label">The Solution</div>
              <p className="brr-body">
                A database&#8209;driven system with role&#8209;based access,
                centralising items, acquisitions, price history, and sales
                so the team can price with confidence and serve collectors
                faster.
              </p>
            </div>

            {/* SPINE */}
            <div className="brr-spine" />

            {/* RIGHT PAGE */}
            <div className="brr-page brr-page-right" data-page="ii">
              <div className="brr-ornament">&#x2014; &nbsp; &#x2014; &nbsp; &#x2014;</div>

              <div className="brr-book-masthead">
                <ReadingRoomLogo size={36} />
                <div>
                  <div className="brr-book-masthead-text">Britannicus Reading Room</div>
                  <div className="brr-book-masthead-sub">Inventory &amp; Transaction Management</div>
                </div>
              </div>

              <hr className="brr-rule" />

              <div className="brr-chapter-label">INFT 3201 &mdash; Solution Presented By</div>
              <div className="brr-names-grid">
                {["Bidhyashree", "Hayden", "Marvin", "Rachel", "Simeon", "Sreeraj"].map((name) => (
                  <span key={name} className="brr-name-chip">{name}</span>
                ))}
              </div>

              <hr className="brr-rule" style={{ marginTop: 28 }} />

              <div className="brr-chapter-label">Staff Access</div>
              <p
                className="brr-body"
                style={{ fontSize: "0.85rem", color: "#4a5e52", lineHeight: 1.7 }}
              >
                The staff portal provides role&#8209;based access to
                inventory, acquisitions, price tracking, and sales records.
                Authorised personnel only.
              </p>

              <Link href="/login" className="brr-enter-btn">
                Enter Staff Portal
              </Link>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}