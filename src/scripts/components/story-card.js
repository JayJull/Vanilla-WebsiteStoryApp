export function renderStoryCard({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
}) {
  const formattedDate = new Date(createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const truncatedDesc =
    description.length > 120
      ? `${description.substring(0, 120)}...`
      : description;
  const hasLocation =
    lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon);

  return `
    <div class="story-card" data-story-id="${id}" tabindex="0">
      <div class="story-card-header">
        <h2 class="story-card-title">${name}</h2>
        <span class="story-card-date">
          <i class="far fa-calendar-alt"></i> ${formattedDate}
        </span>
      </div>
      <div class="story-card-body">
        <img 
          src="${photoUrl}" 
          alt="Foto cerita: ${name}" 
          class="story-card-image" 
          loading="lazy"
        />
        <p class="story-card-description">${truncatedDesc}</p>
      </div>
      <div class="story-card-footer">
        <div class="story-card-location">
          <i class="fas fa-map-marker-alt"></i>
          ${
            hasLocation
              ? `${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}`
              : "<span>Lokasi tidak tersedia</span>"
          }
        </div>
        <button class="btn-save-story" data-id="${id}">Simpan</button>
        <a href="#/stories/${id}" class="view-detail-btn" aria-label="Lihat detail cerita ${name}">
          Lihat Detail <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}