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

function onPlayerReady(event) {
  console.log('Player is ready');
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    playNextSong();
  }
}

// Search for songs
document.getElementById('searchBtn').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value;
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=AIzaSyBXFXcgcsxqmZGo168pbxOgZAztZnBVd3A`);
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

// Play a song
function playSong(index) {
  currentSongIndex = index;
  const videoId = playlist[index].id.videoId;
  player.loadVideoById(videoId);
  document.getElementById('playPauseBtn').textContent = '⏸';
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

// Update progress bar
setInterval(() => {
  if (player.getDuration()) {
    const progress = (player.getCurrentTime() / player.getDuration()) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
  }
}, 1000);