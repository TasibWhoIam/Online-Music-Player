let player;
let currentSongIndex = 0;
let playlist = [];

// Load YouTube IFrame API
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// Ensure the YouTube iframe player is hidden
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  console.log('Player is ready');
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    playNextSong();
  }
}

// List of YouTube API keys
const apiKeys = [
  'AIzaSyBXFXcgcsxqmZGo168pbxOgZAztZnBVd3A',
  'AIzaSyAPqGf2ZZT7ur9-lvaRBDQ8ms1-T15u3OU'
];
let currentApiKeyIndex = 0;

// Function to get the current API key and cycle to the next one
function getApiKey() {
  const apiKey = apiKeys[currentApiKeyIndex];
  currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
  return apiKey;
}

// Search for songs
document.getElementById('searchBtn').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value;
  const apiKey = getApiKey();
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${apiKey}`);
  const data = await response.json();
  playlist = data.items;
  displayPlaylist();
});

// Display playlist
function displayPlaylist() {
  const playlistElement = document.getElementById('playlist');
  playlistElement.innerHTML = '';
  playlist.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item.snippet.title;
    li.addEventListener('click', () => playSong(index));
    playlistElement.appendChild(li);
  });
}

// Highlight the currently playing song in the playlist
function highlightCurrentSong() {
  const playlistItems = document.querySelectorAll('#playlist li');
  playlistItems.forEach((item, index) => {
    item.style.backgroundColor = index === currentSongIndex ? '#1db954' : '#282828';
  });
}

// Update the song details (title and artist)
function updateSongDetails() {
  const currentSong = playlist[currentSongIndex];
  document.getElementById('songTitle').textContent = currentSong.snippet.title;
  document.getElementById('artistName').textContent = currentSong.snippet.channelTitle;
}

// Play a song
function playSong(index) {
  currentSongIndex = index;
  const videoId = playlist[index].id.videoId;
  player.loadVideoById(videoId);
  document.getElementById('playPauseBtn').textContent = '⏸';
  highlightCurrentSong();
  updateSongDetails();
}

// Play/Pause functionality
document.getElementById('playPauseBtn').addEventListener('click', () => {
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.pauseVideo();
    document.getElementById('playPauseBtn').textContent = '▶';
  } else {
    player.playVideo();
    document.getElementById('playPauseBtn').textContent = '⏸';
  }
});

// Skip to next song
document.getElementById('nextBtn').addEventListener('click', playNextSong);

function playNextSong() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  playSong(currentSongIndex);
}

// Skip to previous song
document.getElementById('prevBtn').addEventListener('click', () => {
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  playSong(currentSongIndex);
});

// Volume control
document.getElementById('volume').addEventListener('input', (e) => {
  player.setVolume(e.target.value * 100);
});

// Update progress bar and thumb position
setInterval(() => {
  if (player && player.getDuration) {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    document.getElementById('currentTime').textContent = formatTime(currentTime);
    document.getElementById('duration').textContent = formatTime(duration);

    const progress = (currentTime / duration) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
    document.getElementById('progressThumb').style.left = `${progress}%`;
  }
}, 1000);

// Seek functionality with thumb animation
const progressBar = document.getElementById('progressBar');
progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = progressBar.offsetWidth;
  const seekTime = (clickX / width) * player.getDuration();
  player.seekTo(seekTime);

  // Update progress and thumb position immediately
  const progress = (clickX / width) * 100;
  document.getElementById('progress').style.width = `${progress}%`;
  document.getElementById('progressThumb').style.left = `${progress}%`;
});

// Dragging the progress thumb
let isDragging = false;
const progressThumb = document.getElementById('progressThumb');

progressThumb.addEventListener('mousedown', () => {
  isDragging = true;
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const rect = progressBar.getBoundingClientRect();
    const dragX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const dragProgress = (dragX / rect.width) * 100;
    const seekTime = (dragX / rect.width) * player.getDuration();

    // Update progress and thumb position during dragging
    document.getElementById('progress').style.width = `${dragProgress}%`;
    progressThumb.style.left = `${dragProgress}%`;
    player.seekTo(seekTime);
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Format time in minutes:seconds
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}
