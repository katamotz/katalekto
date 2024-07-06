uses Gtk
class Pantalla_ejercicio:Gtk.Window
	//euskera: xB-Bx-xBx-xBBx-Hitz Laburra-Hitz ertaina-Hitz luzea-Sasihitz laburra-Sasihitz ertaina-Sasihitz luzea
	box:Box
	aukera1:Box
	aukera2:Box
	aukera3:Box
	botones:Box
	aukera4:Grid
	aukera5:Box
	op_check1:list of CheckButton
	op_check2:list of CheckButton
	op_check3:list of CheckButton
	fon_check:list of CheckButton
	separador:Separator
	label1:Label
	label2:Label
	label3:Label
	boton_crear:Button
	boton_salir:Button
	hitz_kopuru:Label
	hitzak_ariketako:SpinButton
	
	hitzak_array:array of string
	sasihitzak_array:array of string
	fonemas_elegidos: list of string
	ejercicios:list of string
	elegidas_opciones:bool=false
	init
		fonemas_elegidos=new list of string
		ejercicios= new list of string
		
		
	def inicio()
		datos.abriendo_archivos_necesarios()
		desordena_lista_string(ref datos.lemario)
		var hitzak= t.t("Palabra corta-Palabra media-Palabra larga-Palabras cortas y puras")
		var sasihitzak=t.t("Pseudopalabra corta-Pseudopalabra media-Pseudopalabra larga-Pseudopalabras cortas y puras")
		
		hitzak_array=hitzak.split ("-")
		sasihitzak_array=sasihitzak.split ("-")

		box= new Box(Gtk.Orientation.VERTICAL,5)
		label1=new Label(t.t("Sílabas:"))
		label2=new Label(t.t("Palabras:"))
		label3=new Label(t.t("Pseudopalabras:"))
		aukera1= new Box(Gtk.Orientation.HORIZONTAL,5)
		
		op_check1=new list of CheckButton
		aukera1.add(label1)
		for var i=0 to ultimo_de_lista(datos.lista_estructuras)
			op_check1.add(new CheckButton.with_label(datos.lista_estructuras[i]))
			aukera1.add(op_check1.last())
		
		aukera2= new Box(Gtk.Orientation.HORIZONTAL,5)
		aukera2.add(label2)
		op_check2=new list of CheckButton
		for var i=0 to ultimo_de_array(hitzak_array)
			op_check2.add(new CheckButton.with_label(hitzak_array[i]))
			aukera2.add(op_check2.last())
		
		aukera3= new Box(Gtk.Orientation.HORIZONTAL,5)
		aukera3.add(label3)
		op_check3=new list of CheckButton
		for var i=0 to ultimo_de_array(sasihitzak_array)
			op_check3.add(new CheckButton.with_label(sasihitzak_array[i]))
			aukera3.add(op_check3.last())
		
		aukera4= new Grid()
		fon_check=new list of CheckButton
		var x=0
		var y=0
		for var i=0 to ultimo_de_lista(datos.lista_fonemas)
			fon_check.add(new CheckButton.with_label(datos.lista_fonemas[i]))
			aukera4.attach(fon_check.last(), x, y, 1, 1);
			x+=1
			if x>10
				x=0
				y+=1
		separador= new Separator(Gtk.Orientation.HORIZONTAL)
		
		boton_crear= new Button.with_label(t.t("Crear"))
		boton_salir= new Button.with_label(t.t("Salir"))
		botones= new Box(Gtk.Orientation.HORIZONTAL,0)
		botones.pack_start(boton_crear,true,false,0)
		botones.pack_start(boton_salir,true,false,0)
		
		aukera5= new Box(Gtk.Orientation.HORIZONTAL,5)
		hitz_kopuru= new Label(t.t("Palabras por ejercicio"))
		hitzak_ariketako= new SpinButton.with_range(6,100,1)
		hitzak_ariketako.adjustment.value_changed.connect(cambio_hitzak_ariketako)
		aukera5.add(hitz_kopuru)
		aukera5.add(hitzak_ariketako)
		
		
		box.pack_start(aukera1,true,true,0)
		box.pack_start(aukera2,true,true,0)
		box.pack_start(aukera3,true,true,0)
		box.pack_start(separador,true,true,0)
		box.pack_start(aukera4,true,true,0)
		box.pack_start(aukera5,true,true,0)
		box.pack_start(botones,true,false,0)
		
		aukera4.row_homogeneous = true
		aukera4.column_homogeneous = true
		
		
		this.add(box)
		this.show_all()
		this.set_size_request(400,300)
		this.set_modal(true)
		this.set_transient_for(katalekto)
		
		// conects....
		this.boton_crear.clicked.connect(accion_crear)
		this.boton_salir.clicked.connect(accion_salir)
	
	def cambio_hitzak_ariketako()
		pass
		
	def accion_salir()
		this.box.destroy()
		this.hide()
		
	def accion_crear()
		print "comienza creación"
		ejercicios.clear()
		fonemas_elegidos.clear()
		for var i=0 to ultimo_de_lista(fon_check)
			if fon_check[i].active
				fonemas_elegidos.add(fon_check[i].get_label())
		elegidas_opciones=false
		crear_silabas()
		crear_palabras()
		crear_pseudopalabras()
		creando_ejercicio()
		print "acaba creación"
	
	def anade_ejercicios (n:int,lista:list of string)
		if n<=tamano_de_lista(lista)
			for var i=0 to (n-1)
				var p= lista[i]
				ejercicios.add(p)
		else if not lista_vacia(lista)// si no hay elementos suficientes y la lista no esta vacia
			for var i=0 to ultimo_de_lista(lista)
				ejercicios.add(lista[i])
			for var i=0 to (n-ultimo_de_lista(lista)-2)
				var num=Random.int_range(0,ultimo_de_lista(lista)+1)
				ejercicios.add(lista[num])
		else
			print "no hay elementos"
			
				
	def crear_palabras()
		var miejercicio= new list of string
		
		var tamano_max_palabra=1
		var tamano_min_palabra=5
		
		// cuando se marca la casilla palabras
		if op_check2[0].active==true // hitz labur
			elegidas_opciones=true
			miejercicio.clear()
			tamano_min_palabra=1
			tamano_max_palabra=5
			for var x=0 to ultimo_de_lista(fonemas_elegidos)
				for var i=0 to ultimo_de_lista(datos.lemario)
					if datos.lemario[i].contains (fonemas_elegidos[x])
						if longitud(datos.lemario[i]) >=tamano_min_palabra and longitud(datos.lemario[i]) <=tamano_max_palabra 
							miejercicio.add(datos.lemario[i])
					if tamano_de_lista(miejercicio)>hitzak_ariketako.get_value_as_int()
						break
				desordena_lista_string(ref miejercicio)
				anade_ejercicios (hitzak_ariketako.get_value_as_int(),miejercicio)
				miejercicio.clear()
			
		if op_check2[1].active==true // hitz ertain
			miejercicio.clear()
			elegidas_opciones=true
			tamano_min_palabra=6
			tamano_max_palabra=8
			for var x=0 to ultimo_de_lista(fonemas_elegidos)
				for var i=0 to ultimo_de_lista(datos.lemario)
					if datos.lemario[i].contains (fonemas_elegidos[x])
						if longitud(datos.lemario[i]) >=tamano_min_palabra and longitud(datos.lemario[i]) <=tamano_max_palabra 
							miejercicio.add(datos.lemario[i])
					if tamano_de_lista(miejercicio)>hitzak_ariketako.get_value_as_int()
						break
				desordena_lista_string(ref miejercicio)
				anade_ejercicios (hitzak_ariketako.get_value_as_int(),miejercicio)
				miejercicio.clear()
		
		if op_check2[2].active==true // hitz luze
			miejercicio.clear()
			elegidas_opciones=true
			tamano_min_palabra=9
			tamano_max_palabra=15
			for var x=0 to ultimo_de_lista(fonemas_elegidos)
				for var i=0 to ultimo_de_lista(datos.lemario)				
					if datos.lemario[i].contains (fonemas_elegidos[x])
						if longitud(datos.lemario[i]) >=tamano_min_palabra and longitud(datos.lemario[i]) <=tamano_max_palabra 
							miejercicio.add(datos.lemario[i])
					if tamano_de_lista(miejercicio)>hitzak_ariketako.get_value_as_int()
						break

				desordena_lista_string(ref miejercicio)
				anade_ejercicios (hitzak_ariketako.get_value_as_int(),miejercicio)
				miejercicio.clear()
		
		if op_check2[3].active==true // hitz labur puruak
			miejercicio.clear()
			elegidas_opciones=true
			tamano_min_palabra=0
			tamano_max_palabra=5
			for var i=0 to ultimo_de_lista(datos.lemario)
				if datos.es_palabra_pura(datos.lemario[i],fonemas_elegidos)
					if longitud(datos.lemario[i]) >=tamano_min_palabra and longitud(datos.lemario[i]) <=tamano_max_palabra 
						miejercicio.add(datos.lemario[i])
				if tamano_de_lista(miejercicio)>hitzak_ariketako.get_value_as_int()
					break

			desordena_lista_string(ref miejercicio)
			anade_ejercicios (hitzak_ariketako.get_value_as_int(),miejercicio)
			miejercicio.clear()
		
		
	def crear_pseudopalabras()
		var miejercicio= new list of string
		
		var tamano_max_palabra=1
		var tamano_min_palabra=5
		// cuando se marca la casilla palabras
		if op_check3[0].active==true 
			miejercicio.clear()
			elegidas_opciones=true
			tamano_min_palabra=1
			tamano_max_palabra=5
			for var x=0 to ultimo_de_lista(fonemas_elegidos)
				for var i=0 to ultimo_de_lista(datos.lemario)
					if datos.lemario[i].contains (fonemas_elegidos[x])
						if longitud(datos.lemario[i]) >=tamano_min_palabra and longitud(datos.lemario[i]) <=tamano_max_palabra 
							miejercicio.add(datos.crea_pseudopalabra_vocales_sin_cambiar(datos.lemario[i],fonemas_elegidos[x]))
					if tamano_de_lista(miejercicio)>hitzak_ariketako.get_value_as_int()
						break
							
				desordena_lista_string(ref miejercicio)
				anade_ejercicios (hitzak_ariketako.get_value_as_int(),miejercicio)
				miejercicio.clear()
				
		if op_check3[1].active==true 
			miejercicio.clear()
			elegidas_opciones=true
			tamano_min_palabra=6
			tamano_max_palabra=8
			for var x=0 to ultimo_de_lista(fonemas_elegidos)
				for var i=0 to ultimo_de_lista(datos.lemario)
					if datos.lemario[i].contains (fonemas_elegidos[x])
						if longitud(datos.lemario[i]) >=tamano_min_palabra and longitud(datos.lemario[i]) <=tamano_max_palabra 
							miejercicio.add(datos.crea_pseudopalabra_vocales_sin_cambiar(datos.lemario[i],fonemas_elegidos[x]))
					if tamano_de_lista(miejercicio)>hitzak_ariketako.get_value_as_int()
						break

				desordena_lista_string(ref miejercicio)
				anade_ejercicios (hitzak_ariketako.get_value_as_int(),miejercicio)
				miejercicio.clear()
		
		if op_check3[2].active==true 
			miejercicio.clear()
			elegidas_opciones=true
			tamano_min_palabra=9
			tamano_max_palabra=15
			for var x=0 to ultimo_de_lista(fonemas_elegidos)
				for var i=0 to ultimo_de_lista(datos.lemario)
					if datos.lemario[i].contains (fonemas_elegidos[x])
						if longitud(datos.lemario[i]) >=tamano_min_palabra and longitud(datos.lemario[i]) <=tamano_max_palabra 
							miejercicio.add(datos.crea_pseudopalabra_vocales_sin_cambiar(datos.lemario[i],fonemas_elegidos[x]))
					if tamano_de_lista(miejercicio)>hitzak_ariketako.get_value_as_int()
						break
						
				desordena_lista_string(ref miejercicio)
				anade_ejercicios (hitzak_ariketako.get_value_as_int(),miejercicio)
				miejercicio.clear()
			
		if op_check3[3].active==true // sasihitz labur puruak
			miejercicio.clear()
			elegidas_opciones=true
			tamano_min_palabra=0
			tamano_max_palabra=5
			for var i=0 to ultimo_de_lista(datos.lemario)
				if datos.es_palabra_pura(datos.lemario[i],fonemas_elegidos)
					if longitud(datos.lemario[i]) >=tamano_min_palabra and longitud(datos.lemario[i]) <=tamano_max_palabra 
						var pseudo=""
						for var f=0 to ultimo_de_lista(fonemas_elegidos)
							pseudo=datos.crea_pseudopalabra_vocales_sin_cambiar(datos.lemario[i],fonemas_elegidos[f])
						miejercicio.add(pseudo)
				if tamano_de_lista(miejercicio)>hitzak_ariketako.get_value_as_int()
					break

						
			desordena_lista_string(ref miejercicio)
			anade_ejercicios (hitzak_ariketako.get_value_as_int(),miejercicio)
			miejercicio.clear()

		
	def crear_silabas()
		var miejercicio= new list of string
		for var i=0 to ultimo_de_lista(op_check1)
			if op_check1[i].active==true 
				elegidas_opciones=true
				for var s=0 to ultimo_de_lista(datos.lista_silabas)
					var silaba=datos.lista_silabas[s]
					var estructura_elegida= datos.lista_estructuras[i]

					var x=0
					var estr=""
					// analizamos la estructura de cada silaba
					while x<=ultima(silaba)
						if fonemas_elegidos.contains(toma_cadena (silaba,x,x+3)) 
							estr+="x"
							x+=3
						else if fonemas_elegidos.contains(toma_cadena (silaba,x,x+2))
							estr+="x"
							x+=2
						else if fonemas_elegidos.contains(toma_cadena (silaba,x,x+1)) 
							estr+="x"
							x+=1
						else 
							estr+="B"
							x+=1
					//print "Estructura de la silaba elegida: "+estr+ " -- "+estructura_elegida
					if estr==estructura_elegida
						miejercicio.add(silaba)
						
				desordena_lista_string(ref miejercicio)
				anade_ejercicios(hitzak_ariketako.get_value_as_int(),miejercicio)
				miejercicio.clear()
	
	def creando_ejercicio()			
		// creamos los ejercicios convirtiendo a string.
		if not elegidas_opciones
			var m= new MessageDialog(this,DialogFlags.MODAL,MessageType.WARNING,ButtonsType.OK,t.t(("No se ha podido realizar ejercicio. Elija alguna opción.")))
			m.show_all()
			if m.run ()==Gtk.ResponseType.OK do m.hide()
		else if lista_vacia(ejercicios)
			var m= new MessageDialog(this,DialogFlags.MODAL,MessageType.WARNING,ButtonsType.OK,t.t("No se ha podido realizar ejercicio. Elija consonantes mas frecuentes."))
			m.show_all()
			if m.run ()==Gtk.ResponseType.OK do m.hide()
		
		else
			datos.lista_palabras.clear()
			datos.posicion_parrafos.clear()
			datos.posicion_parrafos.add(0)
			katalekto.total_parrafos=0
			katalekto.parrafo_actual=0
			katalekto.palabra_actual=0
			katalekto.palabra_inicio_pantalla=0
			katalekto.palabra_fin_parrafo=0
			
			var n=0
			for var x=0 to ultimo_de_lista(ejercicios)
				// x.to_string()+ejercicios[x]
				datos.lista_palabras.add(ejercicios[x])
				datos.lista_palabras.add("----")
				if n==hitzak_ariketako.get_value_as_int()
					n=0
					datos.posicion_parrafos.add((x*2)-1)
				katalekto.palabra_fin_parrafo+=2
				n+=1
			
			datos.posicion_parrafos.add((ultimo_de_lista(ejercicios)*2))
			//listar_int(datos.posicion_parrafos)
			// borramos la última separación
			datos.lista_palabras.remove_at(ultimo_de_lista(datos.lista_palabras))
			katalekto.palabra_fin_parrafo-=1
			katalekto.ejercicio_abierto=true
			katalekto.palabra_fin_total=katalekto.palabra_fin_parrafo-1
			katalekto.total_parrafos= ultimo_de_lista(datos.posicion_parrafos)
			katalekto.indicador_parrafos.set_range(0,katalekto.total_parrafos-1)
			this.hide()
			this.box.destroy()
	
					
				
			
