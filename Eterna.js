const memoryImages = [
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      "Media/8K1.jpg",
      "Media/8K2.jpg",
      "Media/8K3.jpg",
      "Media/8K4.jpg",
      "Media/8K5.jpg"
    ];

    const slideshow = document.getElementById('memory-slideshow');
    let currentIndex = 0;

    // Create slides
    memoryImages.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.style.backgroundImage = `url(${src})`;
      if (i === 0) slide.classList.add('active');
      slideshow.appendChild(slide);
    });

    // Auto-rotate slideshow
    setInterval(() => {
      const slides = document.querySelectorAll('.slide');
      slides[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('active');
    }, 5000);

    // Page switching
    function showPage(page) {
      document.getElementById('home-page').style.display = page === 'home' ? 'flex' : 'none';
      document.getElementById('capsule-page').style.display = page === 'capsule' ? 'block' : 'none';
    }

    // Default: show home
    showPage('home');