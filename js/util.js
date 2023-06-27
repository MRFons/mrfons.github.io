/*-- Util
================================================== */
(function($) {

	/**
	 * Genera una lista de enlaces indentados a partir de una navegación. Pensado para su uso con panel().
	 * @return {jQuery} Objeto jQuery.
	 */
	$.fn.navList = function() {

		var $this = $(this),
			$a = $this.find('a'),
			b = [];

		$a.each(function() {

			var $this = $(this),
				indent = Math.max(0, $this.parents('li').length - 1),
				href = $this.attr('href'),
				target = $this.attr('target');

			b.push(
				'<a ' +
					'class="link depth-' + indent + '"' +
					( (typeof target !== 'undefined' && target != '') ? ' target="' + target + '"' : '') +
					( (typeof href !== 'undefined' && href != '') ? ' href="' + href + '"' : '') +
				'>' +
					'<span class="indent-' + indent + '"></span>' +
					$this.text() +
				'</a>'
			);

		});

		return b.join('');

	};

	/**
	 * Convierte un elemento en un panel.
	 * @param {object} userConfig Configuración personalizada.
	 * @return {jQuery} Objeto jQuery.
	 */
	$.fn.panel = function(userConfig) {

		// ¿No hay elementos? Salir.
		if (this.length == 0)
			return $this;

		// ¿Múltiples elementos? Recorrer cada uno y aplicar panel().
		if (this.length > 1) {

			for (var i = 0; i < this.length; i++)
				$(this[i]).panel(userConfig);

			return $this;

		}

		// Variables.
		var $this = $(this),
			$body = $('body'),
			$window = $(window),
			id = $this.attr('id'),
			config;

		// Configuración.
		config = $.extend({

			// Retardo.
			delay: 0,

			// Ocultar el panel al hacer clic en un enlace.
			hideOnClick: false,

			// Ocultar el panel al presionar la tecla Escape.
			hideOnEscape: false,

			// Ocultar el panel al deslizar.
			hideOnSwipe: false,

			// Restablecer la posición de desplazamiento al ocultar.
			resetScroll: false,

			// Restablecer los formularios al ocultar.
			resetForms: false,

			// Lado de la ventana donde aparecerá el panel.
			side: null,

			// Elemento de destino para aplicar la clase.
			target: $this,

			// Clase para alternar.
			visibleClass: 'visible'

		}, userConfig);

		// Expandir "target" si aún no es un objeto jQuery.
		if (typeof config.target != 'jQuery')
			config.target = $(config.target);

		// Panel.

		// Métodos.
		$this._hide = function(event) {

			// ¿Ya oculto? Salir.
			if (!config.target.hasClass(config.visibleClass))
				return;

			// Si se proporcionó un evento, cancelarlo.
			if (event) {

				event.preventDefault();
				event.stopPropagation();

			}

			// Ocultar.
			config.target.removeClass(config.visibleClass);

			// Restablecer la posición de desplazamiento.
			if (config.resetScroll)
				$this.scrollTop(0);

			// Restablecer los formularios.
			if (config.resetForms)
				$this.find('form').each(function() {
					this.reset();
				});

		};

		// Visibilidad.
		$this._toggle = function(event) {

			// ¿Ya visible? Ocultar.
			if (config.target.hasClass(config.visibleClass))
				$this._hide(event);

			// ¿De lo contrario? Mostrar.
			else
				$this._show(event);

		};

		// Mostrar.
		$this._show = function(event) {

			// ¿Ya visible? Salir.
			if (config.target.hasClass(config.visibleClass))
				return;

			// Si se proporcionó un evento, cancelarlo.
			if (event) {

				event.preventDefault();
				event.stopPropagation();

			}

			// Ocultar todos los demás paneles.
			if (config.hideOnClick) {

				$body.children().each(function() {

					var $this = $(this);

					if ($this != config.target)
						$this.panel('_hide');

				});

			}

			// Mostrar panel.
			config.target.addClass(config.visibleClass);

			// Restablecer la posición de desplazamiento.
			if (config.resetScroll)
				$this.scrollTop(0);

			// Restablecer los formularios.
			if (config.resetForms)
				$this.find('form').each(function() {
					this.reset();
				});
			// Efecto alerta
			if (config.resetForms)
				$this.find('form').each(function() {
					this.reset();
				}); 
			

		};

		// Esquema.
		if (config.target.length == 0)
			$this.css('display', 'none');

		// Ocultar al hacer clic en un enlace.
		$this.on('click', 'a', function(event) {

			var $a = $(this),
				href = $a.attr('href'),
				target = $a.attr('target');

			// Cancelar clic nulo.
			if (!href || href == '#' || href == '' || href == '#' + id)
				event.preventDefault();

			// Ocultar.
			$this._hide(event);

			// Desplazamiento hacia el anclaje.
			if ($a.attr('href') == '#' + id)
				$window.setTimeout(function() {
					$window.scrollTop($this.offset().top);
				}, config.delay + 10);

		});

		// Ocultar al presionar la tecla Escape.
		if (config.hideOnEscape)
			$window.on('keydown', function(event) {

				if (event.keyCode == 27)
					$this._hide(event);

			});

		// Ocultar al hacer clic fuera del panel.
		$this.on('mousedown touchstart', function(event) {

			// ¿Validar el objetivo?
			if (!config.target.hasClass(config.visibleClass))
				return;

			// ¿Objetivo?
			if (!$(event.target).parents().add(event.target).filter(config.target).length)
				$this._hide(event);

		});

		// Ocultar en el desplazamiento.
		if (config.hideOnSwipe) {

			$this.on('touchstart', function(event) {

				$this.touchPosX = event.originalEvent.touches[0].pageX;
				$this.touchPosY = event.originalEvent.touches[0].pageY;

			});

			$this.on('touchmove', function(event) {

				if ($this.touchPosX === null
				||	$this.touchPosY === null)
					return;

				var diffX = $this.touchPosX - event.originalEvent.touches[0].pageX,
					diffY = $this.touchPosY - event.originalEvent.touches[0].pageY,
					th = $this.outerHeight(),
					ts = ($this.get(0).scrollHeight - $this.scrollTop());

				if (config.side == 'left' && diffX > 0 && (diffY < 0 || diffY > th))
					$this.touchPosX = null;

				else if (config.side == 'right' && diffX < 0 && (diffY < 0 || diffY > th))
					$this.touchPosX = null;

				else if (config.side == 'top' && diffY > 0 && (diffX < 0 || diffX > $this.outerWidth()))
					$this.touchPosY = null;

				else if (config.side == 'bottom' && diffY < 0 && (diffX < 0 || diffX > $this.outerWidth()))
					$this.touchPosY = null;

				// ¿Ocultar?
				if (diffX < 0)
					$this._hide(event);

				// ¿Desplazarse?
				else if (diffX > 0) {

					// Prevent vertical scrolling on Android.
					event.preventDefault();
					event.stopPropagation();

				}

			});

		}

		// Restablecer el panel al cargar.
		$this.on('resetPanel', function() {

			$this._hide();

			setTimeout(function() {
				$this._show();
			}, config.delay + 10);

		});

		// Restablecer el panel al redimensionar.
		$window.on('resize', function() {
			$this._hide();
		});

		return $this;

	};

})(jQuery);
