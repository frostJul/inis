window.onload = function() {
    let selectedElement = null;
    let offsetX, offsetY;
    let isSticky = false;
    let initialPosition = new Map();
    let initialColor = new Map();
    let lastTapTime = 0;
    let touchStartTime = 0;
    let touchStartPosition = { x: 0, y: 0 };

    function startDrag(event) {
        if (event.type === 'mousedown' || (event.type === 'touchstart' && event.touches.length === 1)) {
            const clientX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX;
            const clientY = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY;

            if (event.type === 'touchstart') {
                touchStartTime = new Date().getTime();
                touchStartPosition = { x: clientX, y: clientY };
            }

            if (!isSticky) {
                selectedElement = event.target.classList.contains('target') ? event.target : null;
                if (selectedElement) {
                    offsetX = clientX - selectedElement.getBoundingClientRect().left;
                    offsetY = clientY - selectedElement.getBoundingClientRect().top;
                }
            } else {
                offsetX = clientX - selectedElement.getBoundingClientRect().left;
                offsetY = clientY - selectedElement.getBoundingClientRect().top;
            }
            event.preventDefault();
        }
    }

    function drag(event) {
        if (selectedElement) {
            const clientX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX;
            const clientY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY;

            selectedElement.style.left = clientX - offsetX + 'px';
            selectedElement.style.top = clientY - offsetY + 'px';
            event.preventDefault();
        }
    }

    function stopDrag(event) {
        if (event.type === 'touchend') {
            const currentTime = new Date().getTime();
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;

            //тап
            const touchDuration = currentTime - touchStartTime;
            const touchDistance = Math.sqrt(
                Math.pow(touchEndX - touchStartPosition.x, 2) +
                Math.pow(touchEndY - touchStartPosition.y, 2)
            );

            if (touchDuration < 300 && touchDistance < 10) {
                if (currentTime - lastTapTime < 300) { //дабл
                    toggleStickyMode(selectedElement);
                }
                lastTapTime = currentTime;
            }
        }

        if (!isSticky && event.type !== 'touchend') {
            selectedElement = null;
        }
    }

    function toggleStickyMode(element) {
        if (!isSticky && element) {
            isSticky = true;
            selectedElement = element;
            element.style.backgroundColor = 'blue';
        } else if (isSticky) {
            selectedElement.style.backgroundColor = initialColor.get(selectedElement);
            isSticky = false;
            selectedElement = null;
        }
    }

    function handleMultiTouch(event) {
        if (event.touches.length > 1 && selectedElement) {
            resetElement();
            event.preventDefault();
        }
    }

    function resetElement() {
        if (selectedElement) {
            selectedElement.style.backgroundColor = initialColor.get(selectedElement);
            let { top, left } = initialPosition.get(selectedElement);
            selectedElement.style.left = left;
            selectedElement.style.top = top;
            isSticky = false;
            selectedElement = null;
        }
    }

    document.querySelectorAll('.target').forEach((target) => {
        initialPosition.set(target, {
            top: target.style.top,
            left: target.style.left
        });

        initialColor.set(target, target.style.backgroundColor);

        target.addEventListener('mousedown', startDrag);
        target.addEventListener('dblclick', () => toggleStickyMode(target));
        target.addEventListener('touchstart', startDrag, { passive: false });
        target.addEventListener('touchend', stopDrag, { passive: false });
    });

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', stopDrag, { passive: false });
    document.addEventListener('touchstart', handleMultiTouch, { passive: false });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') {
            resetElement();
        }
    });
};
