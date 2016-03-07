
/* 
-------------------------------------------------------------------------
- Hasiera data: 2014ko maiatzan                                         -
-
 <Kataluga- Programa para trabajar la lectura y escritura>
    Copyright (C) <año>  <nombre del autor>

    Este programa es software libre: usted puede redistribuirlo y/o modificarlo 
    bajo los términos de la Licencia Pública General GNU publicada 
    por la Fundación para el Software Libre, ya sea la versión 3 
    de la Licencia, o (a su elección) cualquier versión posterior.

    Este programa se distribuye con la esperanza de que sea útil, pero 
    SIN GARANTÍA ALGUNA; ni siquiera la garantía implícita 
    MERCANTIL o de APTITUD PARA UN PROPÓSITO DETERMINADO. 
    Consulte los detalles de la Licencia Pública General GNU para obtener 
    una información más detallada. 
-------------------------------------------------------------------------
*/

uses Cairo
uses Gtk

directorio_datos:string
directorio_usuario:string
directorio_sonidos:string
directorio_trabajo:string
katalekto:Katalekto
pantalla_ejercicio:Pantalla_ejercicio
datos:Datos
lienzo_ancho:int=900
lienzo_alto:int=500
sistema_operativo:string
guardado:bool=true
mireloj:uint
relojactivo:bool=false
init
	sistema_operativo="linux"
	// ponemos las variables de entorno en marcha
	directorio_usuario=GLib.Environment.get_home_dir ()+"/.katalekto-1.0"
	directorio_datos=GLib.Environment.get_current_dir ()+"/.."
	directorio_sonidos="/sonidos/zaratak/"
	directorio_trabajo=GLib.Environment.get_home_dir ()
	
	datos= new Datos()
	
	
	// comenzamos gtk y cargamos Kataderno 
	
	Gtk.init(ref args)
	katalekto= new Katalekto()
	katalekto.show_all()
	katalekto.delete_event.connect(saliendo)
	pantalla_ejercicio= new Pantalla_ejercicio()
	pantalla_ejercicio.hide()
	datos.abriendo_archivos_necesarios()
	
	Gtk.main()


		
def saliendo():bool
	Gtk.main_quit()
	return true
	

class Katalekto:Gtk.Window
	box:Gtk.Box
	barra_objetos : Box = new Box (Orientation.HORIZONTAL,20)
	lienzo:DrawingArea
	editor:TextView
	editorscroll:Gtk.ScrolledWindow 
	barra_colores: Box 
	mi_menubar : Gtk.MenuBar
	menu_editar : Gtk.Menu
	menu_leer : Gtk.Menu
	menu_opciones : Gtk.Menu
	menu_idioma : Gtk.Menu
	leer_archivo_item:Gtk.MenuItem
	leer_ejercicio_item:Gtk.MenuItem
	leer_edicion_item:Gtk.MenuItem
	abrir_archivo_item:Gtk.MenuItem
	guardar_archivo_item:Gtk.MenuItem
	guardar_como_archivo_item:Gtk.MenuItem
	nuevo_archivo_item:Gtk.MenuItem
	entrar_archivo_item:Gtk.MenuItem
	salir_archivo_item:Gtk.MenuItem
	castellano_item:Gtk.RadioMenuItem
	euskera_item:Gtk.RadioMenuItem
	
	leer : Gtk.MenuItem
	editar : Gtk.MenuItem
	opciones: Gtk.MenuItem
	idioma: Gtk.MenuItem
	modo_lectura_item: Gtk.MenuItem 
	menu_modo_lectura: Gtk.Menu
	apareciendo_item:Gtk.RadioMenuItem
	desapareciendo_item: Gtk.RadioMenuItem
	porpalabra_item: Gtk.RadioMenuItem
	palabrafija_item: Gtk.RadioMenuItem
	indicador_parrafos : SpinButton
	scale_velocidad: Scale
	scale_tamanoletra: Scale
	boton_atras   : Gtk.Button
	boton_para    : Gtk.Button
	boton_play    : Gtk.Button
	boton_adelante: Gtk.Button
	marcador: list of Gtk.Entry
	
	palabra_actual:int=0
	parar:bool=false
	atras:bool=false
	adelante:bool=false
	play:bool=false
	leyendo:bool=false
	tamano_letra:int=20
	velocidad:int=10
	modolectura:string
	parrafo_actual:int=0
	total_parrafos:int=0
	palabra_inicio_parrafo:int=0
	palabra_inicio_pantalla:int=0
	palabra_fin_total:int
	palabra_fin_parrafo:int=0
	posx:int=0
	posy:int=50
	niveltransparente:double=0
	ejercicio_abierto:bool=false
	archivo_abierto:bool=false
	nombre_archivo_abierto:string
	idioma_actual:string
	extents:Cairo.TextExtents;
	posiciones:list of int
	color_pos:list of int
	
	init 
		idioma_actual="es"
		
		modolectura="apareciendo"
		niveltransparente=1
		inicializa_pantalla()
		posiciones= new list of int
		color_pos= new list of int

	def reloj():bool
		if palabra_actual<=palabra_fin_total
			palabra_actual+=1
			katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)  
		return true
	
	def on_pinta(e : Gtk.Widget,ctx:Context) : bool // funcion para pintar el escenario
		if ejercicio_abierto or archivo_abierto
			if modolectura=="por_palabra" do pinta_por_palabras(ctx)
			if modolectura=="apareciendo" do pinta_apareciendo(ctx)
			if modolectura=="desapareciendo" do pinta_desapareciendo(ctx)
			if modolectura=="palabra_fija" do pinta_palabra_fija(ctx)
		
		return true
	
	
	def pinta_apareciendo(ctx:Context)
		// avanzar o retroceder
		if  (parrafo_actual+1<=total_parrafos) and (palabra_actual>datos.posicion_parrafos[parrafo_actual+1]) and palabra_actual<palabra_fin_total// avanza parrafo
			parrafo_actual+=1 // aumentamos un párrafo.
		else if (parrafo_actual>0) and (palabra_actual<=datos.posicion_parrafos[parrafo_actual]) // retrocede parrafo 
			parrafo_actual-=1 // retrocedemos un párrafo.
		indicador_parrafos.set_text(parrafo_actual.to_string()) // usando set_text y no set_value conseguimos que no llame a la funcion de cambio
		
		// inicializa la palabra inicial y la final para el bucle
		if parrafo_actual==0  // y el parrafo es el primero
			palabra_inicio_pantalla=datos.posicion_parrafos[parrafo_actual]
		else // si son los siguientes párrafos...
			palabra_inicio_pantalla=datos.posicion_parrafos[parrafo_actual]+1
		palabra_fin_parrafo=datos.posicion_parrafos[parrafo_actual+1]

		ctx.select_font_face ("Andika", Cairo.FontSlant.NORMAL, Cairo.FontWeight.NORMAL);
		ctx.set_font_size (tamano_letra);
		
		posx=0
		posy=tamano_letra
		var textox=""
		
		for var i=palabra_inicio_pantalla to palabra_fin_parrafo
			textox=datos.lista_palabras[i]
			extents:Cairo.TextExtents;
			ctx.text_extents (textox+"_", out extents);
			var ancho=(int)extents.width
			if (posx+ancho)>lienzo_ancho
				posy+=(tamano_letra*3/2)
				posx=0
			if (posy>lienzo_alto)
				break
			
			if (i<=palabra_actual) do imprime_palabra(ctx,posx,posy,0,0,0,1,textox)// negro
			//if i==palabra_actual do imprime_palabra(ctx,posx,posy,0,0,0,1,textox)// negro
			
			if palabra_actual-palabra_inicio_pantalla>500
				palabra_actual=palabra_fin_parrafo
				break
			
			posx+=ancho
		
			
	def imprime_palabra(ctx:Context,px:int,py:int,r:double,g:double,b:double,a:double,texto:string)
		var posx=px
		
		//localizar posicion de "ca" y meter en un array las posiciones a colorear después comparar con i
		posiciones.clear()
		color_pos.clear()
		var cr=0.0;var cg=0.0; var cb=0.0 
		for var n=0 to 3
			var marcadortext=marcador[n].get_text()
			var x=busca_cadena(texto,marcadortext,0)
			if x!=-1
				for var i=0 to ultima(marcadortext)
					posiciones.add(x)
					color_pos.add(n)
					x+=1
					
		for var i=0 to ultima(texto)
			var c= toma_letra(texto,i)
			ctx.set_source_rgba(r,g,b,a)
			for var n=0 to ultimo_de_lista(posiciones)
				case color_pos[n]
					when 0
						cr=0;cg=0;cb=1
					when 1
						cr=0;cg=1;cb=0
					when 2
						cr=1;cg=0;cb=0
					when 3
						cr=0.6;cg=0.5;cb=0.1
					
				if i==posiciones[n] do ctx.set_source_rgba(cr,cg,cb,a)
			ctx.move_to (posx,py);
			ctx.text_extents (c, out extents);
			posx+=((int)extents.x_advance)
			ctx.show_text(c);
			ctx.stroke()
			
			
	def pinta_desapareciendo(ctx:Context)
		if  (parrafo_actual+1<=total_parrafos) and (palabra_actual>datos.posicion_parrafos[parrafo_actual+1]) and palabra_actual<palabra_fin_total // avanza parrafo
			parrafo_actual+=1 // aumentamos un párrafo.
		else if (parrafo_actual>0) and (palabra_actual<=datos.posicion_parrafos[parrafo_actual]) // avanza parrafo
			parrafo_actual-=1 // aumentamos un párrafo.
		indicador_parrafos.set_text(parrafo_actual.to_string()) // usando set_text y no set_value conseguimos que no llame a la funcion de cambio

		if parrafo_actual==0 
			palabra_inicio_pantalla=datos.posicion_parrafos[parrafo_actual]
		else
			palabra_inicio_pantalla=datos.posicion_parrafos[parrafo_actual]+1
		palabra_fin_parrafo=datos.posicion_parrafos[parrafo_actual+1]
		
		var ultima=0
		var y=tamano_letra
		var textox=""
		
		for var i=palabra_inicio_pantalla to palabra_fin_parrafo
			ctx.select_font_face ("Andika", Cairo.FontSlant.NORMAL, Cairo.FontWeight.NORMAL);
			ctx.set_font_size (tamano_letra);
			textox=datos.lista_palabras[i]
			extents:Cairo.TextExtents;
			ctx.text_extents (textox+"_", out extents);
			var ancho=(int)extents.width
			if (ultima+ancho)>lienzo_ancho
				y+=(tamano_letra*3/2)
				ultima=0

			if (i>palabra_actual) do imprime_palabra(ctx,ultima,y,0,0,0,1,textox)// negro
			if i==palabra_actual do imprime_palabra(ctx,ultima,y,0,0,0,1-niveltransparente,textox)// negro
			
			ultima+=ancho
			
	def pinta_palabra_fija(ctx:Context)
		var textox=""
		ctx.select_font_face ("Andika", Cairo.FontSlant.NORMAL, Cairo.FontWeight.NORMAL);
		ctx.set_font_size (tamano_letra);
		if palabra_actual<=ultimo_de_lista(datos.lista_palabras) do textox=datos.lista_palabras[palabra_actual]
		extents:Cairo.TextExtents;
		ctx.text_extents (textox+"_", out extents);
		var ancho=(int)extents.width
		ctx.set_source_rgba(0,0,0,1)
		ctx.move_to (lienzo_ancho/2-ancho/2,lienzo_alto/2-tamano_letra/2);
		ctx.show_text(textox);
		ctx.stroke()
			
	
		
	def pinta_por_palabras(ctx:Context)
		if  (parrafo_actual+1<=total_parrafos) and (palabra_actual>datos.posicion_parrafos[parrafo_actual+1]) and palabra_actual<palabra_fin_total // avanza parrafo
			parrafo_actual+=1 // aumentamos un párrafo.
		else if (parrafo_actual>0) and (palabra_actual<=datos.posicion_parrafos[parrafo_actual]) // avanza parrafo
			parrafo_actual-=1 // aumentamos un párrafo.
		indicador_parrafos.set_text(parrafo_actual.to_string()) // usando set_text y no set_value conseguimos que no llame a la funcion de cambio

		if parrafo_actual==0 
			palabra_inicio_pantalla=datos.posicion_parrafos[parrafo_actual]
		else
			palabra_inicio_pantalla=datos.posicion_parrafos[parrafo_actual]+1
		palabra_fin_parrafo=datos.posicion_parrafos[parrafo_actual+1]
		var ultima=0
		var y=tamano_letra
		
		for var i=palabra_inicio_pantalla to palabra_fin_parrafo
			ctx.select_font_face ("Andika", Cairo.FontSlant.NORMAL, Cairo.FontWeight.NORMAL);
			ctx.set_font_size (tamano_letra);
			var textox=datos.lista_palabras[i]
			extents:Cairo.TextExtents;
			ctx.text_extents (textox+"_", out extents);
			var ancho=(int)extents.width
			if ancho+ultima>lienzo_ancho
				y+=(tamano_letra*3/2)
				ultima=0
			if  i==palabra_actual do imprime_palabra(ctx,ultima,y,0,0,0,1,textox)// negro
			ultima+=ancho
			
	

	
		
	def inicializa_pantalla()
		
		// pon la ventana en la medida
		this.set_size_request(lienzo_ancho+40,lienzo_alto)
		this.configure_event.connect(recalcula_cuadro)
		//////////////////////////////////////////////////////////////////////7 lienzo es la zona da dibujo
		lienzo = new DrawingArea()
		lienzo.draw.connect(on_pinta)
		lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)
		lienzo.override_background_color(StateFlags.NORMAL,{1,1,1,1})
		
		//introducimos lienzo (zona de dibujo) en una caja 
		//de eventos para recoger los eventos del raton.
		//caja_eventos= new EventBox ()
		
		

		lienzo.set_can_focus(true)
		lienzo.grab_focus()
		
		/////////////////////////////////////////////////////////////////////////////// Menu
		mi_menubar= new Gtk.MenuBar()
		menu_leer = new Gtk.Menu()
		menu_editar = new Gtk.Menu()
		menu_opciones= new Gtk.Menu()
		menu_modo_lectura =new Gtk.Menu()
		menu_idioma =new Gtk.Menu()
		
		leer_archivo_item= new Gtk.MenuItem.with_label ("Leer archivo")
		leer_ejercicio_item= new Gtk.MenuItem.with_label ("Leer ejercicio")
		leer_edicion_item= new Gtk.MenuItem.with_label ("Leer edición")
		
		abrir_archivo_item= new Gtk.MenuItem.with_label ("Abrir archivo")
		nuevo_archivo_item= new Gtk.MenuItem.with_label ("Nuevo archivo")
		entrar_archivo_item= new Gtk.MenuItem.with_label ("Entrar en edición")
		salir_archivo_item= new Gtk.MenuItem.with_label ("Salir de edición")
		guardar_archivo_item= new Gtk.MenuItem.with_label ("Guardar archivo")
		guardar_como_archivo_item= new Gtk.MenuItem.with_label ("Guardar archivo como...")
		
		castellano_item= new Gtk.RadioMenuItem.with_label (null,"Castellano")
		idiomas:unowned SList
		idiomas=castellano_item.get_group ();
		euskera_item= new Gtk.RadioMenuItem.with_label (idiomas,"Euskera")
		
		apareciendo_item = new Gtk.RadioMenuItem.with_label (null,"Apareciendo")
		modos:unowned SList
		modos=apareciendo_item.get_group()
		desapareciendo_item = new Gtk.RadioMenuItem.with_label (modos,"Desapareciendo")
		porpalabra_item = new Gtk.RadioMenuItem.with_label (modos,"Por palabra")
		palabrafija_item = new Gtk.RadioMenuItem.with_label (modos,"Palabra fija")
		
		modo_lectura_item = new Gtk.MenuItem.with_label ("Modo de Lectura")
		
		menu_leer.append(leer_archivo_item)
		menu_leer.append(leer_ejercicio_item)
		menu_leer.append(leer_edicion_item)
		
		menu_editar.append(abrir_archivo_item)
		menu_editar.append(nuevo_archivo_item)
		menu_editar.append(guardar_archivo_item)
		menu_editar.append(guardar_como_archivo_item)
		menu_editar.append(entrar_archivo_item)
		menu_editar.append(salir_archivo_item)
		
		menu_modo_lectura.append(apareciendo_item)
		menu_modo_lectura.append(desapareciendo_item)
		menu_modo_lectura.append(porpalabra_item)
		menu_modo_lectura.append(palabrafija_item)
		
		menu_idioma.append(castellano_item)
		menu_idioma.append(euskera_item)
		
		modo_lectura_item = new Gtk.MenuItem.with_label ("Modo de Lectura")
		modo_lectura_item.set_submenu(menu_modo_lectura)
		
		menu_opciones.append(modo_lectura_item)
		
		leer=new Gtk.MenuItem.with_mnemonic("Leer")
		leer.set_submenu(menu_leer)

		editar=new Gtk.MenuItem.with_mnemonic("Editar")
		editar.set_submenu(menu_editar)
		
		opciones=new Gtk.MenuItem.with_mnemonic("Opciones")
		opciones.set_submenu(menu_opciones)
		
		
		idioma=new Gtk.MenuItem.with_mnemonic("Idioma")
		idioma.set_submenu(menu_idioma)
		
		
		mi_menubar.append(leer)
		mi_menubar.append(editar)
		mi_menubar.append(opciones)
		mi_menubar.append(idioma)
		
		//conecta con las funciones
		apareciendo_item.activate.connect ( accion_apareciendo )
		desapareciendo_item.activate.connect ( accion_desapareciendo )
		porpalabra_item.activate.connect ( accion_por_palabra )
		palabrafija_item.activate.connect ( accion_palabra_fija )
		
		leer_ejercicio_item.activate.connect(accion_leer_ejercicio)
		leer_archivo_item.activate.connect(accion_leer_archivo)
		leer_edicion_item.activate.connect(accion_leer_edicion)
		nuevo_archivo_item.activate.connect(accion_nuevo_archivo)
		abrir_archivo_item.activate.connect(accion_abrir_archivo)
		guardar_archivo_item.activate.connect(accion_guardar_archivo)
		guardar_como_archivo_item.activate.connect(accion_guardar_como_archivo)
		salir_archivo_item.activate.connect(accion_salir_archivo)
		entrar_archivo_item.activate.connect(accion_entrar_archivo)
		castellano_item.activate.connect(accion_castellano)
		euskera_item.activate.connect(accion_euskera)
		
		//////////////////////////////////////////////////////////////////////////////
		editorscroll = new Gtk.ScrolledWindow (null, null);
		
		editor= new Gtk.TextView ();
		editor.set_wrap_mode (Gtk.WrapMode.WORD);
		editor.buffer.text = "Katalekto es un programa para mejorar la fluidez de lectura de nuestros niños y niñas \n";
		editorscroll.add(editor)
		///////////////////////////////////////////////////////////////////////////// barra_colores
		barra_colores= new Box (Orientation.HORIZONTAL,20)
		
		marcador= new list of Entry
		marcador.add(new Entry())
		marcador.add(new Entry())
		marcador.add(new Entry())
		marcador.add(new Entry())
		
		colorfondo1: Gdk.RGBA = Gdk.RGBA()
		colorfondo1.red=0; colorfondo1.green=0; colorfondo1.blue=1; colorfondo1.alpha=1;
		marcador[0].override_color(StateFlags.NORMAL,colorfondo1)
		
		colorfondo2: Gdk.RGBA = Gdk.RGBA()
		colorfondo2.red=0; colorfondo2.green=1; colorfondo2.blue=0; colorfondo2.alpha=1;
		marcador[1].override_color(StateFlags.NORMAL,colorfondo2)
		
		colorfondo3: Gdk.RGBA = Gdk.RGBA()
		colorfondo3.red=1; colorfondo3.green=0; colorfondo3.blue=0; colorfondo3.alpha=1;
		marcador[2].override_color(StateFlags.NORMAL,colorfondo3)
		
		colorfondo4: Gdk.RGBA = Gdk.RGBA()
		colorfondo4.red=0.6; colorfondo4.green=0.5; colorfondo4.blue=0.1; colorfondo4.alpha=1;
		marcador[3].override_color(StateFlags.NORMAL,colorfondo4)
		
		for var i=0 to 3 do barra_colores.add(marcador[i])
		barra_colores.homogeneous = true
		///////////////////////////////////////////////////////////////////////////// barra_objetos
		boton_atras   = new Button.with_label ("Atrás")
		boton_para    = new Button.with_label ("Stop")
		boton_play    = new Button.with_label ("Play")
		boton_adelante= new Button.with_label ("Adelante")
		boton_atras.clicked.connect(accion_atras)
		boton_para.clicked.connect(accion_parar)
		boton_play.clicked.connect(accion_play)
		boton_adelante.clicked.connect(accion_adelante)
		

		
		
		scale_velocidad = new Scale.with_range (Orientation.HORIZONTAL,10,700,1)
		scale_velocidad.adjustment.value_changed.connect (cambio_velocidad)
		
		// Propiedades de scale_tamaño letra
		scale_tamanoletra = new Scale.with_range (Orientation.HORIZONTAL,20,100,10)
		scale_tamanoletra.adjustment.value_changed.connect (cambio_tamanoletra)
		
		// Propiedades de indicador_parrafos
		indicador_parrafos = new SpinButton.with_range (0, 0, 1);
		indicador_parrafos.adjustment.value_changed.connect(cambio_parrafo)
		//inserta los objetos en la ventana
		
		barra_objetos.homogeneous = true
		barra_objetos.add(scale_tamanoletra)
		barra_objetos.add(scale_velocidad)
		barra_objetos.add(indicador_parrafos)
		
		barra_objetos.add(boton_atras)
		barra_objetos.add(boton_play)
		barra_objetos.add(boton_para)
		barra_objetos.add(boton_adelante)
		barra_objetos.set_border_width(10)
		

		///////////////////////////////////////////////////////////////////// box final
		
		box=new Gtk.Box (Gtk.Orientation.VERTICAL,5);
		box.pack_start(mi_menubar,false, true, 0)
		box.pack_start(barra_objetos,false, true,0)
		box.pack_start(lienzo)
		box.pack_start(barra_colores,false,true,0)
		this.add(box)
		lienzo.show_all()
		box.show()
		
		editor.hide()
		this.show()
		
	def cambio_parrafo()
		parrafo_actual=indicador_parrafos.get_value_as_int ();
		palabra_actual=datos.posicion_parrafos[parrafo_actual]+1
		if parrafo_actual==0 do palabra_actual=0
		play=false
		boton_play.label=("Play")
		if relojactivo do Source.remove (mireloj)
		relojactivo=false
		katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)
		
	def accion_adelante()
		play=false
		boton_play.label=("Play")
		if relojactivo do Source.remove (mireloj)
		relojactivo=false
		if palabra_actual<palabra_fin_total do palabra_actual+=1
		//print "%d %d",palabra_actual, parrafo_actual
		if modolectura=="apareciendo" do niveltransparente=1
		if modolectura=="desapareciendo" do niveltransparente=0
		katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)

	def accion_atras()
		play=false
		boton_play.label=("Play")
		if relojactivo do Source.remove (mireloj)
		relojactivo=false
		if modolectura=="apareciendo" do niveltransparente=1
		if modolectura=="desapareciendo" do niveltransparente=0
		if palabra_actual>0 do palabra_actual-=1
		//print "%d %d",palabra_actual, parrafo_actual
		
		katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)
	
	def accion_parar()
		play=false
		boton_play.label=("Play")
		palabra_actual=0
		parrafo_actual=0
		if modolectura=="apareciendo" do niveltransparente=1
		if modolectura=="desapareciendo" do niveltransparente=0
		palabra_inicio_pantalla=0
		if relojactivo do Source.remove (mireloj)
		relojactivo=false
		indicador_parrafos.set_text(parrafo_actual.to_string())
		katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)
		
	def accion_play()
		if not play
			boton_play.label=("Pausa")
			play=true
			var time=transformavelocidad (velocidad)
			if relojactivo do Source.remove (mireloj)
			mireloj = Timeout.add(time, reloj)
			relojactivo=true
			katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)
		else
			play=false
			boton_play.label=("Play")
			if relojactivo
				Source.remove (mireloj)
				relojactivo=false
			katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)
			
	def accion_leer_edicion()
		if editor.visible
			borrar_pantalla_editor()
		
		var texto= editor.buffer.text
		if texto!="" and texto.replace("\n","")!=""
			borrar_pantalla_editor()
			datos.lista_palabras.clear()
			datos.posicion_parrafos.clear()
			datos.posicion_parrafos.add(0)
			total_parrafos=1
			parrafo_actual=0
			palabra_actual=0
			palabra_inicio_pantalla=0
			palabra_fin_parrafo=0
			
			var cont_palabras=0
			var parrafos=new list of string
			//creamos los parrafos a partir de los enters.
			var parrafo=""
			for var i=0 to ultima(texto)
				if toma_letra(texto,i)!="\n"
					parrafo+=toma_letra(texto,i)
				else
					parrafos.add(parrafo)
					parrafo=""
			if parrafo!="" do parrafos.add(parrafo)
			// separamos las palabras
			for var j=0 to ultimo_de_lista(parrafos)
				var palabras=parrafos[j].split(" ")
				if ultimo_de_array(palabras)>=0
					//print palabras[0]
					for var i=0 to ultimo_de_array(palabras)
						datos.lista_palabras.add(palabras[i].replace("\n",""))
						cont_palabras+=1
					total_parrafos+=1
					datos.posicion_parrafos.add(cont_palabras-1)
				palabra_fin_total=cont_palabras-1
				indicador_parrafos.set_range(0,total_parrafos-2)
			if palabra_fin_total>=0 do ejercicio_abierto=true
			print "fin"
			
	def accion_leer_archivo()
		var FC=  new FileChooserDialog (("Elige un archivo para abrir"), this, Gtk.FileChooserAction.OPEN,
			"_Abrir",Gtk.ResponseType.ACCEPT,
			"_Salir",Gtk.ResponseType.CANCEL);
		FC.set_current_folder (directorio_trabajo)
		FC.select_multiple = false;
		FC.set_modal(true)
		case FC.run ()
			when Gtk.ResponseType.CANCEL
				FC.hide ()
				FC.close ()
			when Gtk.ResponseType.ACCEPT
				FC.hide()
				var direccion=FC.get_filename ();
				var cont_palabras=0
				datos.lista_palabras.clear()
				
				var f = FileStream.open(direccion,"r")
				if f==null
					print "archivo no encontrado "
				else
					print "archivo encontrado"
					var c=""
					datos.lista_palabras.clear()
					datos.posicion_parrafos.clear()
					datos.posicion_parrafos.add(0)
					total_parrafos=1
					parrafo_actual=0
					palabra_actual=0
					palabra_inicio_pantalla=0
					palabra_fin_parrafo=0
					archivo_abierto=false
					cont_palabras=0
					c=f.read_line()
					var palabras=c.split(" ")
						if ultimo_de_array(palabras)>=0
							for var i=0 to ultimo_de_array(palabras)
								datos.lista_palabras.add(palabras[i].replace("\n",""))
								cont_palabras+=1
						total_parrafos+=1
						datos.posicion_parrafos.add(cont_palabras-1)
					while not f.eof()
						c=f.read_line()
						palabras=c.split(" ")
						if ultimo_de_array(palabras)>=0
							for var i=0 to ultimo_de_array(palabras)
								datos.lista_palabras.add(palabras[i].replace("\n",""))
								cont_palabras+=1
							total_parrafos+=1
							datos.posicion_parrafos.add(cont_palabras-1)
						
					palabra_fin_total=cont_palabras-1
					if palabra_fin_total>=0 do ejercicio_abierto=true
					indicador_parrafos.set_range(0,total_parrafos-2)
					
		
	def accion_por_palabra()
		modolectura="por_palabra"
		katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)

	def accion_palabra_fija()
		modolectura="palabra_fija"
		katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)

	def accion_desapareciendo()
		modolectura="desapareciendo"
		niveltransparente=0
		katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)

	def accion_apareciendo()
		modolectura="apareciendo"
		niveltransparente=1
		katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)

	def cambio_tamanoletra()
		tamano_letra=(int)scale_tamanoletra.adjustment.value
		katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)

	def cambio_velocidad()
		velocidad =(int)scale_velocidad.adjustment.value
		var time=transformavelocidad(velocidad)
		if play 
			if relojactivo do Source.remove (mireloj)
			mireloj = Timeout.add(time, reloj)
			relojactivo=true
		katalekto.lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)

	def transformavelocidad (v:int):int
		return (60000/v)+1
		
	def recalcula_cuadro( sender:Gtk.Widget, evento:Gdk.EventConfigure ):bool
		this.boton_adelante.hide()
		this.boton_adelante.show()
		
		lienzo_ancho=evento.width
		lienzo_alto=evento.height
		lienzo.queue_draw_area(0,0,lienzo_ancho,lienzo_alto)
		return true
		
	def borrar_pantalla_lector()
		if not editor.visible
			box.pack_start(editorscroll)
			lienzo.hide()
			barra_objetos.hide()
			barra_colores.hide()
			editorscroll.show()
			editor.show()
	def borrar_pantalla_editor()
		if editor.visible
			lienzo.show()
			barra_objetos.show()
			box.remove(editorscroll)
			editor.hide()
			editorscroll.hide()
			barra_colores.show()

	def accion_euskera()
		idioma_actual="eu"
		
	def accion_castellano()
		idioma_actual="es"
		//euskera_item.set_active (false);
		
	def accion_nuevo_archivo()//de edicion
		borrar_pantalla_lector() // pasamos a edicion
		editor.buffer.text=""
		
	def accion_salir_archivo()//de edicion
		borrar_pantalla_editor()
		
	def accion_entrar_archivo()//de edicion
		borrar_pantalla_lector()
		
		
	def accion_guardar_archivo()//de edicion
		if not editor.visible 
			// mensaje no estas en edición
			pass
		else
			print "guardando"
			var f = FileStream.open(nombre_archivo_abierto,"w")
			f.puts(editor.buffer.text)

		
		
	def accion_guardar_como_archivo() //de edicion
		if not editor.visible do borrar_pantalla_lector()
		var FC=  new FileChooserDialog (("Elige un nombre para guardar..."), this, Gtk.FileChooserAction.SAVE,
		"_Guardar",Gtk.ResponseType.ACCEPT,
		"_Salir",Gtk.ResponseType.CANCEL);
		FC.set_current_folder (directorio_trabajo)
		FC.select_multiple = false;
		FC.set_modal(true)
		case FC.run ()
			when Gtk.ResponseType.CANCEL
				FC.hide ()
				FC.close ()
			when Gtk.ResponseType.ACCEPT
				FC.hide()
				var direccion=FC.get_filename ();
				var f = FileStream.open(direccion,"w")
				if f==null
					print "archivo no encontrado, sera guardado"
					f.puts(editor.buffer.text)
				else
					print "archivo encontrado no se puede usar"
					f.puts(editor.buffer.text)
					
				
	def accion_abrir_archivo() //de edicion
		if not editor.visible 
			borrar_pantalla_lector() // pasamos a edicion
		
		var FC=  new FileChooserDialog (("Elige un archivo para abrir"), this, Gtk.FileChooserAction.OPEN,
		"_Abrir",Gtk.ResponseType.ACCEPT,
		"_Salir",Gtk.ResponseType.CANCEL);
		FC.set_current_folder (directorio_trabajo)
		FC.select_multiple = false;
		FC.set_modal(true)
		case FC.run ()
			when Gtk.ResponseType.CANCEL
				FC.hide ()
				FC.close ()
			when Gtk.ResponseType.ACCEPT
				FC.hide()
				var direccion=FC.get_filename ();
				var f = FileStream.open(direccion,"r")
				if f==null
					print "archivo no encontrado "
				else
					print "archivo encontrado"
					nombre_archivo_abierto=direccion
					editor.buffer.text=""
					var c=f.read_line()
					editor.buffer.text += c+"\n"
					while not f.eof()
						c=f.read_line()
						editor.buffer.text += c+"\n"
		
	def accion_leer_ejercicio()
		pantalla_ejercicio.inicio()
