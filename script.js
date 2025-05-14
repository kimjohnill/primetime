// Main document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu functionality
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');

    // Toggle menu when hamburger icon is clicked
    hamburgerIcon.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mobileMenu.contains(event.target) && !hamburgerIcon.contains(event.target)) {
            mobileMenu.classList.remove('active');
        }
    });

    // Mobile sphere variables - declare at the top
    var mobileScene = null;
    var mobileCamera = null;
    var mobileRenderer = null;
    var mobileAnimId = null;
    var mobileSphere = null;
    var mobileSphere2 = null;

    // Desktop Three.js animation code
    const container = document.getElementById('sphere-animation');

    if (container) {
        try {
            // Position adjustment - only for desktop/tablet now
            container.style.position = 'relative';
            if (window.innerWidth > 768) {
                container.style.top = '-150px';
            } else {
                container.style.top = '-100px';
            }

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });

            // Set pixel ratio to fix pixelation
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(renderer.domElement);

            const loader = document.getElementById('sphere-loader');
            if (loader) {
                loader.style.display = 'none';
            }

            // Higher resolution sphere geometries for smoother appearance
            const geometry = new THREE.SphereGeometry(22, 48, 48);
            const geometry2 = new THREE.SphereGeometry(24, 40, 40);

            // Colors
            const brightBlue = new THREE.Color(0x1360E8);
            const lavenderPurple = new THREE.Color(0xC687FF);
            const white = new THREE.Color(0x000000);

            // Simplified shader with better color balance
            const material = new THREE.ShaderMaterial({
                wireframe: true,
                transparent: true,
                uniforms: {
                    u_time: { value: 0 },
                    u_blue: { value: brightBlue },
                    u_purple: { value: lavenderPurple },
                    u_white: { value: white }
                },
                vertexShader: `
                    varying vec3 vPosition;
                    void main() {
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float u_time;
                    uniform vec3 u_blue;
                    uniform vec3 u_purple;
                    uniform vec3 u_white;
                    varying vec3 vPosition;

                    void main() {
                        vec3 normalizedPos = normalize(vPosition);

                        // Create different noise patterns
                        float noise1 = sin(normalizedPos.x * 5.0 + u_time) * cos(normalizedPos.y * 5.0 + u_time) * 0.5 + 0.5;
                        float noise2 = cos(normalizedPos.z * 4.0 + u_time * 0.7) * 0.5 + 0.5;

                        // First mix blue and purple
                        vec3 color = mix(u_blue, u_purple, noise1);

                        // Then add white highlights (limited to 30% influence)
                        color = mix(color, u_white, noise2 * 0.3);

                        gl_FragColor = vec4(color, 0.7);
                    }
                `
            });

            // Second sphere with colors reversed
            const material2 = new THREE.ShaderMaterial({
                wireframe: true,
                transparent: true,
                uniforms: {
                    u_time: { value: 0 },
                    u_blue: { value: brightBlue },
                    u_purple: { value: lavenderPurple },
                    u_white: { value: white }
                },
                vertexShader: material.vertexShader,
                fragmentShader: `
                    uniform float u_time;
                    uniform vec3 u_blue;
                    uniform vec3 u_purple;
                    uniform vec3 u_white;
                    varying vec3 vPosition;

                    void main() {
                        vec3 normalizedPos = normalize(vPosition);

                        // Create different noise patterns with offset
                        float noise1 = cos(normalizedPos.x * 5.0 + u_time * 0.8) * sin(normalizedPos.y * 5.0 + u_time * 0.8) * 0.5 + 0.5;
                        float noise2 = sin(normalizedPos.z * 4.0 + u_time * 0.5) * 0.5 + 0.5;

                        // First mix purple and blue (reversed)
                        vec3 color = mix(u_purple, u_blue, noise1);

                        // Then add white highlights (limited to 25% influence)
                        color = mix(color, u_white, noise2 * 0.25);

                        gl_FragColor = vec4(color, 0.7);
                    }
                `
            });

            const sphere = new THREE.Mesh(geometry, material);
            const sphere2 = new THREE.Mesh(geometry2, material2);

            sphere.position.set(10, 0, 0);
            sphere2.position.set(10, 0, 0);

            scene.add(sphere, sphere2);

            camera.position.z = 45;
            camera.lookAt(10, 0, 0);

            function animate() {
                requestAnimationFrame(animate);
                const time = performance.now();

                // Update time uniform
                material.uniforms.u_time.value = time * 0.001;
                material2.uniforms.u_time.value = time * 0.001;

                // Sphere rotation
                sphere.rotation.x += 0.003;
                sphere.rotation.y += 0.004;
                sphere2.rotation.x -= 0.002;
                sphere2.rotation.y -= 0.003;

                renderer.render(scene, camera);
            }

            function adjustForTabletDesktop() {
                const viewportWidth = window.innerWidth;

                if (viewportWidth <= 768) {
                    // Tablet settings
                    sphere.position.x = 25.5;
                    sphere2.position.x = 25.5;
                    camera.position.x = 0;
                    camera.position.z = 45;
                    camera.lookAt(25.5, 0, 0);
                    container.style.top = '-100px';
                } else {
                    // Desktop settings
                    sphere.position.x = 5;
                    sphere2.position.x = 5;
                    camera.position.x = 0;
                    camera.position.z = 45;
                    camera.lookAt(5, 0, 0);
                    container.style.top = '-150px';
                }

                // Reset renderer size and maintain pixel ratio
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.setPixelRatio(window.devicePixelRatio);
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
            }

            // Improved resize handler
            function onWindowResize() {
                // Only adjust if we're not on mobile
                if (window.innerWidth > 480) {
                    camera.aspect = container.clientWidth / container.clientHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(container.clientWidth, container.clientHeight);
                    renderer.setPixelRatio(window.devicePixelRatio);
                    adjustForTabletDesktop();
                }
            }

            window.addEventListener('resize', onWindowResize);

            animate();
            adjustForTabletDesktop();
            console.log('Desktop Three.js sphere animation initialized successfully');
        } catch (error) {
            console.error('Error initializing Three.js sphere:', error);
            const loader = document.getElementById('sphere-loader');
            if (loader) {
                loader.style.display = 'none';
            }
        }
    } else {
        console.error('Sphere animation container not found');
    }

    // Initialize mobile half-sphere
    // Main function
    function initMobileHalfSphere() {
        const container = document.getElementById('mobile-sphere-animation');
        if (!container) return;

        // Remove background color for transparency
        container.style.backgroundColor = 'transparent';

        // Create scene
        mobileScene = new THREE.Scene();

        // Create camera
        mobileCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        mobileCamera.position.z = 50;

        // Create renderer with device pixel ratio
        mobileRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        mobileRenderer.setPixelRatio(window.devicePixelRatio); // Fixes pixelation!
        mobileRenderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(mobileRenderer.domElement);

        // Hide loader if present
        const loader = document.getElementById('mobile-sphere-loader');
        if (loader) loader.style.display = 'none';

        // Higher resolution sphere geometries
        const geometry = new THREE.SphereGeometry(22, 48, 48);
        const geometry2 = new THREE.SphereGeometry(24, 40, 40);

        // Colors
        const brightBlue = new THREE.Color(0x1360E8);
        const lavenderPurple = new THREE.Color(0xC687FF);
        const white = new THREE.Color(0x000000);

        // Materials (wireframe)
        const material = new THREE.ShaderMaterial({
            wireframe: true,
            transparent: true,
            uniforms: {
                u_time: { value: 0 },
                u_blue: { value: brightBlue },
                u_purple: { value: lavenderPurple },
                u_white: { value: white }
            },
            vertexShader: `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float u_time;
                uniform vec3 u_blue;
                uniform vec3 u_purple;
                uniform vec3 u_white;
                varying vec3 vPosition;

                void main() {
                    vec3 normalizedPos = normalize(vPosition);
                    float noise1 = sin(normalizedPos.x * 5.0 + u_time) * cos(normalizedPos.y * 5.0 + u_time) * 0.5 + 0.5;
                    float noise2 = cos(normalizedPos.z * 4.0 + u_time * 0.7) * 0.5 + 0.5;
                    vec3 color = mix(u_blue, u_purple, noise1);
                    color = mix(color, u_white, noise2 * 0.3);
                    gl_FragColor = vec4(color, 0.7);
                }
            `
        });

        const material2 = new THREE.ShaderMaterial({
            wireframe: true,
            transparent: true,
            uniforms: {
                u_time: { value: 0 },
                u_blue: { value: brightBlue },
                u_purple: { value: lavenderPurple },
                u_white: { value: white }
            },
            vertexShader: material.vertexShader,
            fragmentShader: `
                uniform float u_time;
                uniform vec3 u_blue;
                uniform vec3 u_purple;
                uniform vec3 u_white;
                varying vec3 vPosition;

                void main() {
                    vec3 normalizedPos = normalize(vPosition);
                    float noise1 = cos(normalizedPos.x * 5.0 + u_time * 0.8) * sin(normalizedPos.y * 5.0 + u_time * 0.8) * 0.5 + 0.5;
                    float noise2 = sin(normalizedPos.z * 4.0 + u_time * 0.5) * 0.5 + 0.5;
                    vec3 color = mix(u_purple, u_blue, noise1);
                    color = mix(color, u_white, noise2 * 0.25);
                    gl_FragColor = vec4(color, 0.7);
                }
            `
        });

        // Create meshes
        mobileSphere = new THREE.Mesh(geometry, material);
        mobileSphere2 = new THREE.Mesh(geometry2, material2);

        // Position spheres
        mobileSphere.position.set(22, 0, 0);
        mobileSphere2.position.set(22, 0, 0);

        // Add to scene
        mobileScene.add(mobileSphere, mobileSphere2);

        // Animation function
        function animateMobile() {
            mobileAnimId = requestAnimationFrame(animateMobile);

            // Update time
            const time = performance.now() * 0.001;
            material.uniforms.u_time.value = time;
            material2.uniforms.u_time.value = time;

            // Sphere rotation
            mobileSphere.rotation.x += 0.003;
            mobileSphere.rotation.y += 0.004;
            mobileSphere2.rotation.x -= 0.002;
            mobileSphere2.rotation.y -= 0.003;

            // Render
            mobileRenderer.render(mobileScene, mobileCamera);
        }

        // Start animation
        animateMobile();

        // Responsive resize handler
        function onWindowResize() {
            if (!container || !mobileCamera || !mobileRenderer) return;
            mobileCamera.aspect = container.clientWidth / container.clientHeight;
            mobileCamera.updateProjectionMatrix();
            mobileRenderer.setSize(container.clientWidth, container.clientHeight);
            mobileRenderer.setPixelRatio(window.devicePixelRatio); // Keep it sharp on resize
        }

        window.addEventListener('resize', onWindowResize);

        // Store handler for cleanup if needed
        mobileRenderer._onResize = onWindowResize;
    }

    // Initialize on mobile only
    if (window.innerWidth <= 480) {
        initMobileHalfSphere();
    }

    // Handle resize for mobile/desktop switching
    window.addEventListener('resize', function() {
        // If switching to mobile and not already initialized
        if (window.innerWidth <= 480 && !mobileRenderer) {
            initMobileHalfSphere();
        }
        // If switching to desktop, clean up
        else if (window.innerWidth > 480 && mobileRenderer) {
            cancelAnimationFrame(mobileAnimId);
            if (mobileRenderer.domElement.parentNode) {
                mobileRenderer.domElement.parentNode.removeChild(mobileRenderer.domElement);
            }
            if (mobileRenderer._onResize) {
                window.removeEventListener('resize', mobileRenderer._onResize);
            }
            mobileRenderer = null;
            mobileScene = null;
            mobileCamera = null;
            mobileSphere = null;
            mobileSphere2 = null;
        }
    });

    // SERVICE CARD HOVER EFFECT
    // Enhanced card hover effect with slower expansion and subtle lingering on exit
    if (window.matchMedia('(hover: hover) and (min-width: 1025px)').matches) {
        // Updated selector to target card links instead of service cards
        const cards = document.querySelectorAll('.card-link');

        cards.forEach(card => {
            // Updated selectors to find elements within the card link
            const imageContainer = card.querySelector('.service-card-image');
            const primaryImage = card.querySelector('.primary-image');
            const secondaryImage = card.querySelector('.secondary-image');
            const circleOverlay = card.querySelector('.circle-overlay');

            // Ensure images are visible initially
            if (primaryImage) primaryImage.style.opacity = '1';
            if (secondaryImage) secondaryImage.style.opacity = '1';

            // Clear any existing content in overlay
            if (circleOverlay) circleOverlay.innerHTML = '';

            // Create mask container with transparent background initially
            const maskContainer = document.createElement('div');
            maskContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: transparent; /* Start transparent */
                pointer-events: none;
                transition: background-color 0.3s ease;
            `;
            if (circleOverlay) circleOverlay.appendChild(maskContainer);

            // Create circle holes for dissolving effect
            const circles = [];
            const numCircles = 12;

            for (let i = 0; i < numCircles; i++) {
                const circle = document.createElement('div');
                // Random position (5-95% of container for better coverage)
                const x = Math.random() * 90 + 5;
                const y = Math.random() * 90 + 5;

                // Random size (smaller circles for dissolve effect)
                const size = Math.random() * 15 + 5; // 5-20% size

                // Calculate max scale needed to cover from this position
                const distToCorner = Math.max(
                    Math.sqrt(x*x + y*y),
                    Math.sqrt(x*x + (100-y)*(100-y)),
                    Math.sqrt((100-x)*(100-x) + y*y),
                    Math.sqrt((100-x)*(100-x) + (100-y)*(100-y))
                );

                // Set circle styles - these will be "holes" in the mask
                circle.style.cssText = `
                    position: absolute;
                    left: ${x}%;
                    top: ${y}%;
                    width: ${size}%;
                    height: ${size}%;
                    border-radius: 50%;
                    background-color: white;
                    transform: scale(0);
                    transition: transform 2s cubic-bezier(0.19, 1, 0.22, 1);
                    transform-origin: center center;
                `;

                // Store the max scale needed for this circle
                circle.dataset.maxScale = (distToCorner / (size/2)).toFixed(2);

                // Random delay for dissolve effect
                const randomDelay = Math.random() * 0.2;
                circle.style.transitionDelay = `${randomDelay}s`;

                if (maskContainer) maskContainer.appendChild(circle);
                circles.push(circle);
            }

            // Fix z-index stacking
            if (circleOverlay) circleOverlay.style.zIndex = '2';
            if (primaryImage) primaryImage.style.zIndex = '1';
            if (secondaryImage) secondaryImage.style.zIndex = '0';

            // Set up hover events - using the card link for hover events
            card.addEventListener('mouseenter', () => {
                // Make mask background black on hover to trigger the inverse effect
                if (maskContainer) maskContainer.style.backgroundColor = 'black';

                circles.forEach(circle => {
                    // SLOWER expansion (2s) with easeOutQuart for gradual start
                    circle.style.transition = "transform 2s cubic-bezier(0.19, 1, 0.22, 1)";
                    // Small random delay for natural dissolve effect
                    circle.style.transitionDelay = `${Math.random() * 0.2}s`;
                    // Use the calculated max scale to ensure full coverage
                    circle.style.transform = `scale(${circle.dataset.maxScale})`;
                });
            });

            card.addEventListener('mouseleave', () => {
                circles.forEach(circle => {
                    // Moderate exit (0.4s) with very slight delay for subtle lingering
                    circle.style.transition = "transform 0.4s ease-out";
                    // Small random delay (up to 0.1s) for subtle lingering effect
                    circle.style.transitionDelay = `${Math.random() * 0.1}s`;
                    circle.style.transform = 'scale(0)';
                });

                // Delay making the mask transparent until circles have shrunk
                setTimeout(() => {
                    if (maskContainer) maskContainer.style.backgroundColor = 'transparent';
                }, 400); // Match the exit transition time
            });
        });
    }

    // Function to check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight * 0.75) &&
            rect.bottom >= 0
        );
    }

    // Get the line elements
    const line1to2 = document.querySelector('.line-1-to-2');
    const line2to3 = document.querySelector('.line-2-to-3');

    // Function to check scroll position and animate lines
    function checkScroll() {
        // First line animation trigger
        if (line1to2 && isElementInViewport(document.getElementById('step-create'))) {
            line1to2.classList.add('active');
        }

        // Second line animation trigger
        if (line2to3 && isElementInViewport(document.getElementById('step-deliver'))) {
            line2to3.classList.add('active');
        }
    }

    // Check on scroll
    window.addEventListener('scroll', checkScroll);

    // Initial check
    checkScroll();

    // =====================
    // Scrolling lines
    // =====================
    // Register ScrollTrigger plugin if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Get SVG paths
        const path1 = document.querySelector('.path-1-to-2');
        const path2 = document.querySelector('.path-2-to-3');

        if (path1 && path2) {
            // Get the SVG container
            const svg = document.querySelector('svg.connector-lines');

            if (svg) {
                // Get the path1 points
                const path1Start = path1.getPointAtLength(0);
                const path1End = path1.getPointAtLength(path1.getTotalLength());

                // Get the original path2 start point
                const originalPath2Start = path2.getPointAtLength(0);

                // Create a completely new path definition for path2
                // This ensures it ends exactly at the x-coordinate of path1Start
                // But starts at its original y-position below the middle circle
                const path2StartX = originalPath2Start.x; // Keep original X
                const path2StartY = originalPath2Start.y; // Keep original Y
                const path2EndY = path2.getPointAtLength(path2.getTotalLength()).y;

                // Create a new path definition: start at original position, go down, then left to align with path1Start
                const newPath2Data = `M ${path2StartX},${path2StartY} V ${path2EndY} H ${path1Start.x}`;
                path2.setAttribute('d', newPath2Data);

                // Now get the updated path length and end point
                const path2Length = path2.getTotalLength();
                const path2End = path2.getPointAtLength(path2Length);

                // Set initial state - invisible paths
                gsap.set(path1, {
                    strokeDasharray: path1.getTotalLength(),
                    strokeDashoffset: path1.getTotalLength()
                });

                gsap.set(path2, {
                    strokeDasharray: path2Length,
                    strokeDashoffset: path2Length
                });

                // Create circles at path points
                function createCircle(id, x, y, radius, fill, opacity) {
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("id", id);
                    circle.setAttribute("cx", x);
                    circle.setAttribute("cy", y);
                    circle.setAttribute("r", radius);
                    circle.setAttribute("fill", fill);
                    circle.setAttribute("opacity", opacity);
                    svg.appendChild(circle);
                    return circle;
                }

                // Create fixed circles - initially invisible (opacity 0)
                const startCircle = createCircle("start-circle", path1Start.x, path1Start.y, 5, "#000000", 0);
                const middleCircle = createCircle("middle-circle", path1End.x, path1End.y, 5, "#000000", 0);
                const endCircle = createCircle("end-circle", path1Start.x, path2End.y, 5, "#000000", 0); // Using path1Start.x to align

                // Create radiating circles - initially invisible (opacity 0)
                const startRadiating = createCircle("start-radiating", path1Start.x, path1Start.y, 5, "#000000", 0);
                const middleRadiating = createCircle("middle-radiating", path1End.x, path1End.y, 5, "#000000", 0);
                const endRadiating = createCircle("end-radiating", path1Start.x, path2End.y, 5, "#000000", 0); // Using path1Start.x to align

                // Create radiating animation for each circle (initially paused)
                function createRadiatingAnimation(circle) {
                    return gsap.timeline({repeat: -1, paused: true})
                        .to(circle, {
                            attr: {r: 15},
                            opacity: 0,
                            duration: 1.5,
                            ease: "sine.out"
                        })
                        .set(circle, {
                            attr: {r: 5},
                            opacity: 0.8
                        });
                }

                // Create the radiating animations (paused initially)
                const startRadiatingAnim = createRadiatingAnimation(startRadiating);
                const middleRadiatingAnim = createRadiatingAnimation(middleRadiating);
                const endRadiatingAnim = createRadiatingAnimation(endRadiating);

                // Function to fade in a circle and start its radiating animation
                function fadeInCircle(circle, radiatingCircle, radiatingAnim) {
                    gsap.to(circle, {
                        opacity: 1,
                        duration: 0.5,
                        ease: "power2.out",
                        onComplete: () => {
                            gsap.set(radiatingCircle, { opacity: 0.8 });
                            radiatingAnim.play();
                        }
                    });
                }

                // Improved function to completely fade out both circles
                function fadeOutCircle(circle, radiatingCircle, radiatingAnim) {
                    radiatingAnim.pause();

                    gsap.to([circle, radiatingCircle], {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.in",
                        onComplete: () => {
                            gsap.set([circle, radiatingCircle], { opacity: 0 });
                        }
                    });
                }

                // Create animation for first path
                gsap.to(path1, {
                    strokeDashoffset: 0,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: "#step-create",
                        start: "top 80%",
                        end: "+=250",
                        scrub: 0.5,
                        markers: false,
                        id: "path1"
                    }
                });

                // Create animation for second path
                gsap.to(path2, {
                    strokeDashoffset: 0,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: "#step-deliver",
                        start: "top 80%",
                        end: "+=250",
                        scrub: 0.5,
                        markers: false,
                        id: "path2"
                    }
                });

                // Independent ScrollTrigger for start circle
                ScrollTrigger.create({
                    trigger: "#step-create",
                    start: "top 80%",
                    end: "+=50", // Short range to make it appear quickly
                    scrub: true,
                    id: "start-circle-control",
                    onEnter: () => {
                        fadeInCircle(startCircle, startRadiating, startRadiatingAnim);
                    },
                    onLeaveBack: () => {
                        fadeOutCircle(startCircle, startRadiating, startRadiatingAnim);
                    }
                });

                // Independent ScrollTrigger for middle circle
                ScrollTrigger.create({
                    trigger: "#step-create",
                    start: "top 50%", // Appears when we're halfway through the first section
                    end: "+=50",
                    scrub: true,
                    id: "middle-circle-control",
                    onEnter: () => {
                        fadeInCircle(middleCircle, middleRadiating, middleRadiatingAnim);
                    },
                    onLeaveBack: () => {
                        fadeOutCircle(middleCircle, middleRadiating, middleRadiatingAnim);
                    }
                });

                // Independent ScrollTrigger for end circle
                ScrollTrigger.create({
                    trigger: "#step-deliver",
                    start: "top 50%", // Appears when we're halfway through the second section
                    end: "+=50",
                    scrub: true,
                    id: "end-circle-control",
                    onEnter: () => {
                        fadeInCircle(endCircle, endRadiating, endRadiatingAnim);
                    },
                    onLeaveBack: () => {
                        fadeOutCircle(endCircle, endRadiating, endRadiatingAnim);
                    }
                });

                // Refresh ScrollTrigger when window resizes
                window.addEventListener('resize', () => {
                    ScrollTrigger.refresh();
                });
            }
        }
    }
});

// =====================
// CONTACT FORM - Using event delegation approach
// =====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("Contact form initialization starting");

    // Use event delegation - attach to document instead of specific elements
    document.addEventListener('click', function(e) {
        // Check if clicked element or any of its parents has the contact-trigger class
        const trigger = e.target.closest('.contact-trigger');
        if (trigger) {
            console.log("Contact trigger clicked via delegation");
            e.preventDefault();
            const contactFormContainer = document.getElementById('contact-form-container');
            if (contactFormContainer) {
                document.body.style.overflow = 'hidden';
                contactFormContainer.classList.add('active');
            }
        }
    });

    // The rest of your contact form code (close button, form submission)
    const contactFormContainer = document.getElementById('contact-form-container');
    const closeContactForm = document.getElementById('close-contact-form');

    if (closeContactForm && contactFormContainer) {
        closeContactForm.addEventListener('click', function() {
            console.log("Close button clicked");
            contactFormContainer.classList.remove('active');
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 500);
        });

        contactFormContainer.addEventListener('click', function(e) {
            if (e.target === contactFormContainer) {
                console.log("Clicked outside form");
                contactFormContainer.classList.remove('active');
                setTimeout(() => {
                    document.body.style.overflow = '';
                }, 500);
            }
        });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            console.log("Form submitted");
            e.preventDefault();

            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const inquiry = document.getElementById('inquiry').value;

            // Here you would typically send the data to your server
            console.log('Form submitted:', { name, email, inquiry });

            // Show success message
            alert('Thank you for your message! We will get back to you soon.');

            // Reset form and close it
            contactForm.reset();
            contactFormContainer.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});
