

"use strict";

const songs = [
  {
    title: "Midnight",
    artist: "Artist One",
    src: "songs/midnight.mp3",
    cover: "covers/midnight.jpg"
  },
  {
    title: "Song Two",
    artist: "Artist Two",
    src: "songs/song-two.mp3",
    cover: "covers/midnight.jpg"
  },
  {
    title: "Song Three",
    artist: "Artist Three",
    src: "songs/song-three.mp3",
    cover: "covers/midnight.jpg"
  }
];

const $ = (id) => document.getElementById(id);

const audio = $("audio");
const title = $("title");
const artist = $("artist");
const cover = $("cover");
const playBtn = $("play");
const progress = $("progress");
const currentTime = $("currentTime");
const duration = $("duration");
const songList = $("songList");

let currentIndex = 0;
let shuffle = false;
let repeat = false;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);

  return `${min}:${String(sec).padStart(2, "0")}`;
}

function loadSong(index, autoplay = false) {
  currentIndex = index;
  const song = songs[index];

  audio.src = song.src;
  title.textContent = song.title;
  artist.textContent = song.artist;
  cover.src = song.cover;

  progress.value = 0;
  currentTime.textContent = "0:00";
  duration.textContent = "0:00";

  renderSongs();

  if (autoplay) {
    audio.play().catch(() => {
      playBtn.textContent = "▶";
    });
  }

  updatePlayButton();
}

function updatePlayButton() {
  playBtn.textContent = audio.paused ? "▶" : "Ⅱ";
  playBtn.setAttribute(
    "aria-label",
    audio.paused ? "Putar" : "Jeda"
  );
}

function togglePlay() {
  if (audio.paused) {
    audio.play().catch((error) => {
      console.warn("Lagu tidak dapat diputar:", error);
    });
  } else {
    audio.pause();
  }
}

function nextSong() {
  let nextIndex;

  if (shuffle && songs.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * songs.length);
    } while (nextIndex === currentIndex);
  } else {
    nextIndex = (currentIndex + 1) % songs.length;
  }

  loadSong(nextIndex, true);
}

function previousSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  const prevIndex =
    (currentIndex - 1 + songs.length) % songs.length;

  loadSong(prevIndex, true);
}

function renderSongs() {
  songList.innerHTML = "";

  songs.forEach((song, index) => {
    const button = document.createElement("button");
    button.className =
      "song" + (index === currentIndex ? " active" : "");

    button.innerHTML = `
      <img src="${song.cover}" alt="">
      <div class="song-details">
        <div class="song-title"></div>
        <div class="song-artist"></div>
      </div>
      <span class="song-mark">
        ${index === currentIndex && !audio.paused ? "♫" : "♪"}
      </span>
    `;

    button.querySelector(".song-title").textContent =
      song.title;

    button.querySelector(".song-artist").textContent =
      song.artist;

    button.addEventListener("click", () => {
      loadSong(index, true);
    });

    songList.appendChild(button);
  });

  $("songCount").textContent = `${songs.length} songs`;
}

playBtn.addEventListener("click", togglePlay);

$("next").addEventListener("click", nextSong);
$("prev").addEventListener("click", previousSong);

$("shuffle").addEventListener("click", () => {
  shuffle = !shuffle;
  $("shuffle").classList.toggle("active", shuffle);
});

$("repeat").addEventListener("click", () => {
  repeat = !repeat;
  audio.loop = repeat;
  $("repeat").classList.toggle("active", repeat);
});

$("volume").addEventListener("input", (event) => {
  audio.volume = Number(event.target.value);
});

progress.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime =
      (Number(progress.value) / 100) * audio.duration;
  }
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (audio.duration > 0 && Number.isFinite(audio.duration)) {
    progress.value =
      (audio.currentTime / audio.duration) * 100;
  }

  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("play", () => {
  updatePlayButton();
  renderSongs();
});

audio.addEventListener("pause", () => {
  updatePlayButton();
  renderSongs();
});

audio.addEventListener("ended", () => {
  if (!repeat) nextSong();
});

$("listButton").addEventListener("click", () => {
  $("library").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

audio.volume = 0.8;

loadSong(0);
