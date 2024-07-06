
class Datos:Object
	lista_fonemas:list of string
	lista_vocales:list of string
	lista_estructuras:list of string
	lista_palabras:list of string
	lemario:list of string
	lista_silabas:list of string
	archivo_configuracion:list of string
	posicion_parrafos:list of int
	
		
	init
				
		archivo_configuracion= new list of string
		lista_palabras= new list of string
		lista_silabas= new list of string
		lemario= new list of string
		posicion_parrafos= new list of int
		lista_fonemas= new list of string
		lista_vocales= new list of string
		lista_estructuras= new list of string
		
	def abriendo_archivos_necesarios()
		lista_silabas.clear()
		var f = FileStream.open(directorio_datos+"/palabras/silaba-"+katalekto.idioma_actual,"r")
		print directorio_datos+"/palabras/silaba-eu"
		if f==null
			print "archivo de silabas no encontrado "
		else
			print "archivo de silabas encontrado"
			var c=""
			c=f.read_line()
			var sil=c.split("-")
			for var i=0 to ultimo_de_array(sil)
				lista_silabas.add(sil[i])
		
		lista_fonemas.clear()
		lista_vocales.clear()
		f = FileStream.open(directorio_datos+"/palabras/fonema-"+katalekto.idioma_actual,"r")
		print directorio_datos+"/palabras/fonema-eu"
		if f==null
			print "archivo de silabas no encontrado "
		else
			print "archivo de silabas encontrado"
			var c=""
			c=f.read_line()
			var sil=c.split("-")
			for var i=0 to ultimo_de_array(sil)
				lista_fonemas.add(sil[i])
			c=f.read_line()
			sil=c.split("-")
			for var i=0 to ultimo_de_array(sil)
				lista_vocales.add(sil[i])
				
		lista_estructuras.clear()		
		f = FileStream.open(directorio_datos+"/palabras/estructuras-"+katalekto.idioma_actual,"r")
		if f==null
			print "archivo de silabas no encontrado "
		else
			print "archivo de silabas encontrado"
			var c=""
			c=f.read_line()
			var sil=c.split("-")
			for var i=0 to ultimo_de_array(sil)
				lista_estructuras.add(sil[i])
		
		lemario.clear()
		f = FileStream.open(directorio_datos+"/palabras/palabras-"+katalekto.idioma_actual,"r")
		print directorio_datos+"/palabras/palabras-eu"
		if f==null
			print "archivo de silabas no encontrado "
		else
			print "archivo de silabas encontrado"
			var c=""
			c=f.read_line()
			var sil=c.split("-")
			for var i=0 to ultimo_de_array(sil)
				lemario.add(sil[i])

	def crea_pseudopalabra_vocales (palabra:string):string
		var r=palabra
		var intentos=0
		if longitud(r)>0
			while r==palabra and intentos<10
				intentos++
				var i=Random.int_range(0, longitud(r))
				var letra=toma_letra(r,i)
				
				case letra
					when "a","e","i","o","u"
						r=sobrescribe_letra(r,selecciona_item_str_azar_array({"a","e","i","o","u"}),i)
						r=r.replace("uu","uo").replace("oo","uo").replace("ii","io").replace("ee","ue").replace("aa","ai")
					when "d"
						r=sobrescribe_letra(r,selecciona_item_str_azar_array({"b","p","t"}),i)
					when "b"
						r=sobrescribe_letra(r,selecciona_item_str_azar_array({"d","p"}),i)
					when "p"
						r=sobrescribe_letra(r,selecciona_item_str_azar_array({"b","d"}),i)
					when "n"
						r=sobrescribe_letra(r,"m",i)
					when "m"
						r=sobrescribe_letra(r,"n",i)
					when "t"
						r=sobrescribe_letra(r,selecciona_item_str_azar_array({"f","d"}),i)
					when "f"
						r=sobrescribe_letra(r,selecciona_item_str_azar_array({"d","t"}),i)
		return r
	
	def crea_pseudopalabra_vocales_sin_cambiar (palabra:string,x:string):string //crea pseudo palabra pero sin cambiar las letras contenidas en x
		
		var r=palabra.replace(x,"*")
		var r1=palabra.replace(x,"*")
		var intentos=0
		while r==r1
			intentos++
			if intentos>20 do break
			var i=Random.int_range(0, longitud(r))
			var letra=toma_letra(r,i)
			case letra
				when "a","e","i","o","u"
					r=sobrescribe_letra(r,selecciona_item_str_azar_array({"a","e","i","o","u"}),i)
					r=r.replace("uu","uo").replace("oo","uo").replace("ii","io").replace("ee","ue").replace("aa","ai")
				when "d"
					r=sobrescribe_letra(r,selecciona_item_str_azar_array({"b","p","t"}),i)
				when "b"
					r=sobrescribe_letra(r,selecciona_item_str_azar_array({"d","p"}),i)
				when "p"
					r=sobrescribe_letra(r,selecciona_item_str_azar_array({"b","d"}),i)
				when "n"
					r=sobrescribe_letra(r,"m",i)
				when "m"
					r=sobrescribe_letra(r,"n",i)
				when "t"
					r=sobrescribe_letra(r,selecciona_item_str_azar_array({"f","d"}),i)
				when "f"
					r=sobrescribe_letra(r,selecciona_item_str_azar_array({"d","t"}),i)
		
		r=r.replace("*",x)
		return r
	
	def crea_lista_palabras_puras(consonantes:list of string):list of string
		var res= new list of string
		for var x=0 to ultimo_de_lista(datos.lemario)
			var mipalabra=datos.lemario[x]
			for var i=0 to ultimo_de_lista(datos.lista_vocales)
				borra_letra(mipalabra,busca_cadena(mipalabra,datos.lista_vocales[i]))
			for var i=0 to ultimo_de_lista(datos.lista_fonemas)
				borra_letra(mipalabra,busca_cadena(mipalabra,datos.lista_fonemas[i]))
			if mipalabra!=""
				res.add(mipalabra)
		return res
		
	def es_palabra_pura (palabra:string,fonemas:list of string):bool
		var mipalabra=palabra
		var res=false
		avocales:array of string = {"a","e","i","o","u"}
		for var i=0 to ultimo_de_array(avocales)
			mipalabra=mipalabra.replace(avocales[i],"")
		for var i=0 to ultimo_de_lista(fonemas)
			mipalabra=mipalabra.replace(fonemas[i],"")
		if mipalabra=="" do res=true
		return res
	
	def crea_lista_de_longitud (l:int,lista:list of string):list of string
		var res= new list of string
		for var i=0 to ultimo_de_lista(lista)
			if longitud(lista[i])<=l do res.add(lista[i])
		return res
	
	def crea_lista_de_sonidos_desde_palabra(s:string): list of string
		letras:list of string= new list of string
		var cont=0
		while cont <=ultima(s)
			
			var fonemas_triples=crea_lista_de_longitud(3,lista_fonemas)
			var triple=toma_cadena(s,cont,cont+3)
			if (triple!="") and (fonemas_triples.contains(triple))
				cont+=3
				letras.add(triple)
			else
				var fonemas_dobles=crea_lista_de_longitud(2,lista_fonemas)
				var doble=toma_cadena(s,cont,cont+2)
				if (doble!="") and (fonemas_dobles.contains(doble))
					cont+=2
					letras.add(doble)
				else
					//simples restantes
					var simple=toma_cadena(s,cont,cont+1)
					cont+=1
					letras.add(simple)
			
		return letras
	
