/*-- Main
================================================== */
(function ($) {

	var $window = $(window),
		$head = $('head'),
		$body = $('body');

	// Breakpoints (Puntos de quiebre).
	breakpoints({
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
		small: ['481px', '736px'],
		xsmall: ['361px', '480px'],
		xxsmall: [null, '360px'],
		'xlarge-to-max': '(min-width: 1681px)',
		'small-to-xlarge': '(min-width: 481px) and (max-width: 1680px)'
	});

	// Detiene las animaciones/transiciones hasta que la página haya cargado.

	// ... cargado.
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
	});

	// ... dejado de redimensionar.
	var resizeTimeout;

	$window.on('resize', function () {

		// Marcar como redimensionando.
		$body.addClass('is-resizing');

		// Desmarcar después de un retraso.
		clearTimeout(resizeTimeout);

		resizeTimeout = setTimeout(function () {
			$body.removeClass('is-resizing');
		}, 100);

	});

	// Arreglos.

	// Imágenes con ajuste de objeto (object-fit).
	if (!browser.canUse('object-fit') || browser.name == 'safari')
		$('.image.object').each(function () {

			var $this = $(this),
				$img = $this.children('img');

			// Ocultar imagen original.
			$img.css('opacity', '0');

			// Establecer fondo.
			$this
				.css('background-image', 'url("' + $img.attr('src') + '")')
				.css('background-size', $img.css('object-fit') ? $img.css('object-fit') : 'cover')
				.css('background-position', $img.css('object-position') ? $img.css('object-position') : 'center');

		});

	// Barra lateral.
	var $sidebar = $('#sidebar'),
		$sidebar_inner = $sidebar.children('.inner');

	// Inactivo por defecto en <= grande.
	breakpoints.on('<=large', function () {
		$sidebar.addClass('inactive');
	});

	breakpoints.on('>large', function () {
		$sidebar.removeClass('inactive');
	});

	// Solución alternativa: Solución alternativa para el error de posición de la barra de desplazamiento en Chrome/Android.
	if (browser.os == 'android' && browser.name == 'chrome')
		$('<style>#sidebar .inner::-webkit-scrollbar { display: none; }</style>')
			.appendTo($head);

	// Alternar.
	$('<a href="#sidebar" class="toggle">Alternar</a>')
		.appendTo($sidebar)
		.on('click', function (event) {

			// Prevenir el comportamiento predeterminado.
			event.preventDefault();
			event.stopPropagation();

			// Alternar.
			$sidebar.toggleClass('inactive');

		});

	// Eventos.

	// Clic en los enlaces.
	$sidebar.on('click', 'a', function (event) {

		// ¿>grande? Salir.
		if (breakpoints.active('>large'))
			return;

		// Variables.
		var $a = $(this),
			href = $a.attr('href'),
			target = $a.attr('target');

		// Prevenir el comportamiento predeterminado.
		event.preventDefault();
		event.stopPropagation();

		// Comprobar la URL.
		if (!href || href == '#' || href == '')
			return;

		// Ocultar la barra lateral.
		$sidebar.addClass('inactive');

		// Redirigir a href.
		setTimeout(function () {

			if (target == '_blank')
				window.open(href);
			else
				window.location.href = href;

		}, 500);

	});

	// Evitar que ciertos eventos dentro del panel se propaguen.
	$sidebar.on('click touchend touchstart touchmove', function (event) {

		// ¿>grande? Salir.
		if (breakpoints.active('>large'))
			return;

		// Evitar la propagación.
		event.stopPropagation();

	});

	// Ocultar el panel al hacer clic/tocar en el cuerpo.
	$body.on('click touchend', function (event) {

		// ¿>grande? Salir.
		if (breakpoints.active('>large'))
			return;

		// Desactivar.
		$sidebar.addClass('inactive');

	});

	// Bloqueo de desplazamiento.
	// Nota: Si haces algo para cambiar la altura del contenido de la barra lateral, asegúrate de
	// activar 'resize.sidebar-lock' en $window para que no se desincronice.

	$window.on('load.sidebar-lock', function () {

		var sh, wh, st;

		// Restablecer la posición de desplazamiento a 0 si es 1.
		if ($window.scrollTop() == 1)
			$window.scrollTop(0);

		$window
			.on('scroll.sidebar-lock', function () {

				var x, y;

				// ¿<=grande? Salir.
				if (breakpoints.active('<=large')) {

					$sidebar_inner
						.data('locked', 0)
						.css('position', '')
						.css('top', '');

					return;

				}

				// Calcular posiciones.
				x = Math.max(sh - wh, 0);
				y = Math.max(0, $window.scrollTop() - x);

				// Bloquear/desbloquear.
				if ($sidebar_inner.data('locked') == 1) {

					if (y <= 0)
						$sidebar_inner
							.data('locked', 0)
							.css('position', '')
							.css('top', '');
					else
						$sidebar_inner
							.css('top', -1 * x);

				}
				else {

					if (y > 0)
						$sidebar_inner
							.data('locked', 1)
							.css('position', 'fixed')
							.css('top', -1 * x);

				}

			})
			.on('resize.sidebar-lock', function () {

				// Calcular alturas.
				wh = $window.height();
				sh = $sidebar_inner.outerHeight() + 30;

				// Desencadenar desplazamiento.
				$window.trigger('scroll.sidebar-lock');

			})
			.trigger('resize.sidebar-lock');

	});

	// Menú.
	var $menu = $('#menu'),
		$menu_openers = $menu.children('ul').find('.opener');

	// Abrepuertas.
	$menu_openers.each(function () {

		var $this = $(this);

		$this.on('click', function (event) {

			// Prevenir el comportamiento predeterminado.
			event.preventDefault();

			// Alternar.
			$menu_openers.not($this).removeClass('active');
			$this.toggleClass('active');

			// Desencadenar cambio de tamaño (bloqueo de la barra lateral).
			$window.triggerHandler('resize.sidebar-lock');

		});

	});

	// Formulario de contacto.

    // Obtener el elemento del formulario por su ID
    const contactForm = document.getElementById('contact-form');

    // Agregar un evento de escucha para el envío del formulario
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitar el envío del formulario por defecto

        // Obtener el valor del campo de nombre
        const nameInput = document.getElementById('demo-name');
        const name = nameInput.value;

        // Mostrar la alerta con el mensaje personalizado
        alert('Mensaje enviado, gracias por sus palabras ' + name);
	});
})(jQuery);