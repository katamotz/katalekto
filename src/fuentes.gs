class Fuentes:Gtk.Window 
	selection:Gtk.FontSelection
	box:Gtk.Box
	button:Gtk.Button
	salir:Gtk.Button
	
	init
		this.title = t.t("Selección de fuente");
		this.window_position = Gtk.WindowPosition.CENTER;
		this.set_default_size (350, 70);
		this.set_deletable(false)
		this.set_transient_for(katalekto)
		this.set_modal(true)
		

		// A VBox:
		box= new Gtk.Box (Gtk.Orientation.VERTICAL, 0);
		this.add (box);

		// The FontSelection:
		selection= new Gtk.FontSelection ();
		box.add (selection);

		// A Button:
		button = new Gtk.Button.with_label (t.t("Seleccionar"));
		box.add (button);
		button.clicked.connect (on_clic) 
		
		
		this.delete_event.connect(on_salir)
		
		
	def on_clic()
		// Emitted when a font has been chosen:
		katalekto.fuente= selection.get_family ();
		katalekto.fuente_str=katalekto.fuente.get_name()
		this.hide()

	def on_salir():bool
		this.hide()
		return true
