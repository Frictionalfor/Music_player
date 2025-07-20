class AestheticMusicPlayer {
            constructor() {
                this.songs = [];
                this.currentIndex = 0;
                this.isPlaying = false;
                this.audio = document.getElementById('audioPlayer');
                this.initializeElements();
                this.bindEvents();
                this.loadSongs();
                this.createSparkles();
                this.addAestheticEffects();
            }

            initializeElements() {
                this.fileInput = document.getElementById('musicFile');
                this.songList = document.getElementById('songList');
                this.player = document.getElementById('player');
                this.currentSongName = document.getElementById('currentSongName');
                this.playPauseBtn = document.getElementById('playPauseBtn');
                this.prevBtn = document.getElementById('prevBtn');
                this.nextBtn = document.getElementById('nextBtn');
                this.progressBar = document.getElementById('progressBar');
                this.progressFill = document.getElementById('progressFill');
                this.currentTime = document.getElementById('currentTime');
                this.totalTime = document.getElementById('totalTime');
                this.volumeSlider = document.getElementById('volumeSlider');
            }

            createSparkles() {
                setInterval(() => {
                    if (Math.random() < 0.1) {
                        const sparkle = document.createElement('div');
                        sparkle.className = 'sparkle';
                        sparkle.style.left = Math.random() * window.innerWidth + 'px';
                        sparkle.style.top = Math.random() * window.innerHeight + 'px';
                        document.body.appendChild(sparkle);
                        
                        setTimeout(() => {
                            sparkle.remove();
                        }, 3000);
                    }
                }, 200);
            }

            addAestheticEffects() {
                // Smooth page reveal
                document.body.style.opacity = '0';
                setTimeout(() => {
                    document.body.style.transition = 'opacity 1.5s ease-in-out';
                    document.body.style.opacity = '1';
                }, 100);

                // Dynamic glow effects
                setInterval(() => {
                    if (this.isPlaying) {
                        document.querySelectorAll('.song-item.active').forEach(item => {
                            item.style.boxShadow = `
                                0 10px 30px rgba(255, 107, 157, ${0.2 + Math.random() * 0.3}),
                                inset 0 1px 0 rgba(255, 255, 255, 0.1)
                            `;
                        });
                    }
                }, 1000);
            }

            bindEvents() {
                this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
                this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
                this.prevBtn.addEventListener('click', () => this.previousSong());
                this.nextBtn.addEventListener('click', () => this.nextSong());
                this.progressBar.addEventListener('click', (e) => this.setProgress(e));
                this.volumeSlider.addEventListener('input', (e) => this.setVolume(e));
                
                this.audio.addEventListener('timeupdate', () => this.updateProgress());
                this.audio.addEventListener('ended', () => this.nextSong());
                this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
            }

            handleFileSelect(event) {
                const files = Array.from(event.target.files);
                files.forEach((file, index) => {
                    const song = {
                        id: Date.now() + Math.random(),
                        name: file.name.replace(/\.[^/.]+$/, ""),
                        file: file,
                        url: URL.createObjectURL(file)
                    };
                    this.songs.push(song);
                    this.renderSong(song, this.songs.length - 1);
                });

                this.saveSongs();
                if (this.songs.length > 0 && !this.isPlaying) {
                    this.loadSong(0);
                }
            }

            renderSong(song, index) {
                const listItem = document.createElement('li');
                listItem.className = 'song-item';
                listItem.dataset.id = song.id;
                listItem.innerHTML = `
                    <div class="song-info">
                        <span class="song-index">\${index + 1}.</span>
                        <span class="song-name">\${song.name}</span>
                    </div>
                    <button class="remove-btn" onclick="event.stopPropagation(); musicPlayer.removeSong('\${song.id}')">✕</button>
                `;
                listItem.addEventListener('click', () => this.loadSongById(song.id));
                this.songList.appendChild(listItem);
            }

            loadSongs() {
                const savedSongs = JSON.parse(localStorage.getItem('aestheticPlaylist') || '[]');
                this.songs = savedSongs.map(songData => ({
                    id: songData.id,
                    name: songData.name,
                    url: songData.url
                }));
                
                this.songs.forEach((song, index) => {
                    this.renderSong(song, index);
                });
                
                if (this.songs.length > 0) {
                    this.loadSong(0);
                }
            }

            saveSongs() {
                const songsToSave = this.songs.map(song => ({
                    id: song.id,
                    name: song.name,
                    url: song.url
                }));
                localStorage.setItem('aestheticPlaylist', JSON.stringify(songsToSave));
            }

            loadSong(index) {
                if (index >= 0 && index < this.songs.length) {
                    this.currentIndex = index;
                    const song = this.songs[index];
                    
                    // Handle both file objects and URLs
                    if (song.file && song.file instanceof File) {
                        this.audio.src = URL.createObjectURL(song.file);
                    } else if (song.url) {
                        this.audio.src = song.url;
                    }
                    
                    this.currentSongName.textContent = song.name;
                    this.updatePlaylistDisplay();
                    
                    if (this.isPlaying) {
                        this.audio.play().catch(e => console.log('Playback failed:', e));
                    }
                }
            }

            loadSongById(id) {
                const index = this.songs.findIndex(song => song.id == id);
                if (index !== -1) {
                    this.loadSong(index);
                }
            }

            togglePlayPause() {
                if (this.songs.length === 0) return;
                
                if (this.audio.paused) {
                    this.audio.play().then(() => {
                        this.isPlaying = true;
                        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        this.updatePlaylistDisplay();
                    }).catch(e => console.log('Playback failed:', e));
                } else {
                    this.audio.pause();
                    this.isPlaying = false;
                    this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    this.updatePlaylistDisplay();
                }
            }

            nextSong() {
                if (this.songs.length === 0) return;
                this.currentIndex = (this.currentIndex + 1) % this.songs.length;
                this.loadSong(this.currentIndex);
                if (this.isPlaying) {
                    this.audio.play().catch(e => console.log('Playback failed:', e));
                }
            }

            previousSong() {
                if (this.songs.length === 0) return;
                this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
                this.loadSong(this.currentIndex);
                if (this.isPlaying) {
                    this.audio.play().catch(e => console.log('Playback failed:', e));
                }
            }

            setProgress(event) {
                if (!this.audio.duration) return;
                const rect = this.progressBar.getBoundingClientRect();
                const clickX = event.clientX - rect.left;
                const width = rect.width;
                const duration = this.audio.duration;
                this.audio.currentTime = (clickX / width) * duration;
            }

            setVolume(event) {
                this.audio.volume = event.target.value;
                localStorage.setItem('aestheticVolume', event.target.value);
            }

            updateProgress() {
                if (!this.audio.duration) return;
                const { currentTime, duration } = this.audio;
                const progressPercent = (currentTime / duration) * 100;
                this.progressFill.style.width = `\${progressPercent}%`;
                this.currentTime.textContent = this.formatTime(currentTime);
            }

            updateDuration() {
                if (this.audio.duration) {
                    this.totalTime.textContent = this.formatTime(this.audio.duration);
                }
            }

            formatTime(time) {
                if (isNaN(time)) return '0:00';
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60);
                return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }

            updatePlaylistDisplay() {
                document.querySelectorAll('.song-item').forEach((item, index) => {
                    item.classList.remove('active', 'playing');
                    item.style.boxShadow = '';
                    
                    if (index === this.currentIndex) {
                        item.classList.add('active');
                        if (this.isPlaying) {
                            item.classList.add('playing');
                        }
                    }
                });
            }

            removeSong(id) {
                const index = this.songs.findIndex(song => song.id == id);
                if (index === -1) return;
                
                // If removing current song
                if (index === this.currentIndex) {
                    if (this.songs.length > 1) {
                        // Load next song or previous if it's the last song
                        const nextIndex = index < this.songs.length - 1 ? index : index - 1;
                        this.loadSong(nextIndex);
                        this.currentIndex = nextIndex;
                    } else {
                        // Last song, stop playback
                        this.audio.pause();
                        this.isPlaying = false;
                        this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                        this.currentSongName.textContent = 'No song selected';
                    }
                } else if (index < this.currentIndex) {
                    // Adjust current index if removing song before current
                    this.currentIndex--;
                }
                
                // Remove from array and DOM
                this.songs.splice(index, 1);
                document.querySelector(`[data-id="\${id}"]`).remove();
                
                // Re-render song numbers
                this.reorderSongList();
                this.saveSongs();
            }

            reorderSongList() {
                const songItems = document.querySelectorAll('.song-item');
                songItems.forEach((item, index) => {
                    const indexSpan = item.querySelector('.song-index');
                    if (indexSpan) {
                        indexSpan.textContent = `\${index + 1}.`;
                    }
                });
            }

            shuffle() {
                if (this.songs.length <= 1) return;
                
                const currentSong = this.songs[this.currentIndex];
                for (let i = this.songs.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
                }
                
                // Find new index of current song
                this.currentIndex = this.songs.findIndex(song => song.id === currentSong.id);
                
                // Re-render playlist
                this.songList.innerHTML = '';
                this.songs.forEach((song, index) => {
                    this.renderSong(song, index);
                });
                
                this.updatePlaylistDisplay();
                this.saveSongs();
            }

            clearPlaylist() {
                this.songs = [];
                this.currentIndex = 0;
                this.isPlaying = false;
                this.audio.pause();
                this.audio.src = '';
                this.songList.innerHTML = '';
                this.currentSongName.textContent = 'No song selected';
                this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                this.progressFill.style.width = '0%';
                this.currentTime.textContent = '0:00';
                this.totalTime.textContent = '0:00';
                localStorage.removeItem('aestheticPlaylist');
            }

            // Initialize volume from localStorage
            initializeVolume() {
                const savedVolume = localStorage.getItem('aestheticVolume');
                if (savedVolume !== null) {
                    this.audio.volume = parseFloat(savedVolume);
                    this.volumeSlider.value = savedVolume;
                } else {
                    this.audio.volume = 0.5;
                    this.volumeSlider.value = 0.5;
                }
            }
        }

        // Initialize player when DOM is loaded
        let musicPlayer;
        document.addEventListener('DOMContentLoaded', () => {
            musicPlayer = new AestheticMusicPlayer();
            musicPlayer.initializeVolume();
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!musicPlayer) return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    musicPlayer.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    musicPlayer.previousSong();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    musicPlayer.nextSong();
                    break;
            }
        });
