/**
 * Footer Physics Animation using Matter.js
 * Handles dropping, dragging, and bouncing "buttons" in the footer.
 */

/**
 * Footer Physics Animation using Matter.js
 * Handles dropping, dragging, and bouncing "buttons" in the footer.
 */

/**
 * Footer Physics Animation using Matter.js
 * Handles floating "space-like" buttons in the footer.
 */

function initFooterPhysics() {
    const Engine = Matter.Engine,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Body = Matter.Body,
        Vector = Matter.Vector;

    // Configuration
    const containerId = 'footer-physics-world';
    const container = document.getElementById(containerId);

    if (!container) {
        console.error('Physics container not found!');
        return;
    }

    // Button Data
    const buttonsData = [
        { text: 'Email', url: 'mailto:uxrishu@gmail.com', icon: 'fa-solid fa-envelope', bgColor: '#D44638' },
        { text: 'WhatsApp', url: 'https://wa.me/919264918690', icon: 'fa-brands fa-whatsapp', bgColor: '#25D366' },
        { text: 'Behance', url: 'https://www.behance.net/uxrishu', icon: 'fa-brands fa-behance', bgColor: '#1769FF' },
        { text: 'Github', url: 'https://github.com/uxrishu', icon: 'fa-brands fa-github', bgColor: '#333333' },
        { text: 'Linkedin', url: 'https://www.linkedin.com/in/uxrishu/', icon: 'fa-brands fa-linkedin-in', bgColor: '#0077B5' }
    ];

    // Create Engine
    const engine = Engine.create();
    const world = engine.world;

    // Zero Gravity for Space Effect
    engine.gravity.y = 0;
    engine.gravity.x = 0;

    // Create Runner
    const runner = Runner.create();

    // Dimensions
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Store objects
    const gameObjects = [];
    let floor, leftWall, rightWall, ceiling;
    const wallThickness = 200;

    // Create Walls
    function createWalls() {
        if (floor) Composite.remove(world, [floor, leftWall, rightWall, ceiling]);

        const wallOptions = {
            isStatic: true,
            render: { visible: false },
            friction: 0,
            restitution: 0.9 // Reduced slightly from 1.0 to prevent energy buildup
        };

        // Walls aligned perfectly with container edges, accounting for their thickness
        // Floor
        floor = Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, wallOptions);
        // Ceiling
        ceiling = Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, wallOptions);
        // Left Wall
        leftWall = Bodies.rectangle(0 - wallThickness / 2, height / 2, wallThickness, height * 2, wallOptions);
        // Right Wall
        rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, wallOptions);

        Composite.add(world, [floor, leftWall, rightWall, ceiling]);
    }

    createWalls();

    // Create Button Function
    function createButton(data, x, y) {
        // DOM Element
        const btn = document.createElement('a');
        btn.href = data.url;
        // content with icon
        btn.innerHTML = `<i class="${data.icon}"></i> ${data.text}`;
        btn.className = 'physics-btn';
        btn.target = "_blank";

        // Hover Effects
        btn.style.transition = "background-color 0.3s, color 0.3s";

        btn.addEventListener('mouseenter', () => {
            btn.style.backgroundColor = data.bgColor;
            btn.style.color = '#ffffff';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.backgroundColor = '#ffffff';
            btn.style.color = '#000000';
        });

        if (data.url.startsWith('mailto:')) btn.target = "_self";

        // Initial Styles
        btn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        btn.style.willChange = 'transform';

        container.appendChild(btn);

        // Dimensions
        const rect = btn.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const r = h / 2;

        // Physics Body
        const body = Bodies.rectangle(x, y, w, h, {
            chamfer: { radius: r },
            restitution: 0.9, // High bounciness
            friction: 0,
            frictionAir: 0, // No air resistance for space effect
            density: 0.001,
            angle: (Math.random() - 0.5) * 0.5
        });

        // Apply random initial velocity
        Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
        });

        // Apply random slow rotation
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.02);

        Composite.add(world, body);
        gameObjects.push({ body, element: btn, w, h });
    }

    // Loop
    function update() {

        for (let i = 0; i < gameObjects.length; i++) {
            const obj = gameObjects[i];
            const { x, y } = obj.body.position;
            const angle = obj.body.angle;

            // Keep them moving if they stop
            if (obj.body.speed < 0.5) {
                Body.applyForce(obj.body, obj.body.position, {
                    x: (Math.random() - 0.5) * 0.001,
                    y: (Math.random() - 0.5) * 0.001
                });
            }

            // Boundary safety check
            if (y > height + 200 || y < -height * 2 - 200 || x < -200 || x > width + 200) {
                Body.setPosition(obj.body, { x: width / 2, y: height / 2 });
                Body.setVelocity(obj.body, { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 });
            }

            obj.element.style.transform = `translate3d(${x - obj.w / 2}px, ${y - obj.h / 2}px, 0) rotate(${angle}rad)`;
        }

        requestAnimationFrame(update);
    }

    // Start Function
    let dropped = false;
    function startSimulation() {
        if (dropped) return;
        dropped = true;

        // Start Physics
        Runner.run(runner, engine);
        requestAnimationFrame(update);

        // Spawn Buttons scattered in the view
        buttonsData.forEach((data, index) => {
            // Random positions inside the container
            const x = Math.random() * (width - 100) + 50;
            const y = Math.random() * (height - 100) + 50;
            createButton(data, x, y);
        });
    }

    // Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startSimulation();
                observer.disconnect();
            }
        });
    }, { threshold: 0.1 });

    observer.observe(container.parentElement);

    // Resize Handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            width = container.clientWidth;
            height = container.clientHeight;
            createWalls();
        }, 200);
    });
}
