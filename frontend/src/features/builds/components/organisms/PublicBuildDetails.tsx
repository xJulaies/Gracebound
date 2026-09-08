import type { Build } from "../../types/build.types";
import type { BuildEditorInitialState } from "../../types/editor.types";

export function PublicBuildDetails({
  build,
  editor,
}: {
  build: Build;
  editor: BuildEditorInitialState;
}) {
  const equippedWeapons = Object.values(editor.selectedWeapons);
  const armor = Object.values(editor.selectedArmor);
  const talismans = Object.values(editor.selectedTalismans);
  const spells = Object.values(editor.selectedSpells);

  return (
    <article className="public-build-details">
      <header className="public-build-details__header">
        <div>
          <p className="mb-2 text-sm uppercase tracking-widest text-foreground-muted">
            Level {build.level} · {editor.selectedClass.name}
          </p>
          <h1 className="mb-3 text-3xl sm:text-5xl">{build.name}</h1>
          <p className="mb-0 max-w-3xl leading-7 text-foreground-muted">
            {build.description || "A Tarnished build shared with the community."}
          </p>
        </div>
        <img
          alt={`${editor.selectedClass.name} starting class`}
          className="public-build-details__portrait"
          src={editor.selectedClass.imageUrl}
        />
      </header>

      <section aria-labelledby="public-build-attributes">
        <h2 className="mb-4 text-2xl" id="public-build-attributes">Attributes</h2>
        <dl className="public-build-details__stats">
          {Object.entries(build.stats).map(([name, value]) => (
            <div className="public-build-details__stat" key={name}>
              <dt>{formatLabel(name)}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="public-build-details__catalogs">
        <CatalogSection heading="Armaments" items={equippedWeapons.map(({ weapon, upgradeLevel }) => ({
          id: weapon.id,
          name: `${weapon.name} +${upgradeLevel}`,
          iconUrl: weapon.iconUrl,
        }))} />
        <CatalogSection heading="Armor" items={armor} />
        <CatalogSection heading="Talismans" items={talismans} />
        <CatalogSection heading="Spells" items={spells} />
        <CatalogSection
          heading="Great Rune & Wondrous Physick"
          items={[
            ...(editor.selectedGreatRune ? [editor.selectedGreatRune] : []),
            ...Object.values(editor.selectedCrystalTears),
          ]}
        />
      </div>
    </article>
  );
}

function CatalogSection({ heading, items }: {
  heading: string;
  items: Array<{ id: string; name: string; iconUrl: string }>;
}) {
  return (
    <section className="public-build-details__catalog" aria-labelledby={`build-${heading.replaceAll(" ", "-").toLowerCase()}`}>
      <h2 className="mb-4 text-xl" id={`build-${heading.replaceAll(" ", "-").toLowerCase()}`}>{heading}</h2>
      {items.length === 0 ? (
        <p className="mb-0 text-sm text-foreground-muted">Nothing recorded.</p>
      ) : (
        <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
          {items.map((item, index) => (
            <li className="public-build-details__item" key={`${item.id}-${index}`}>
              <img alt="" src={item.iconUrl} />
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
