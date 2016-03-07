uses Gee
//[falta] eliminar warnings por unhadled error
class Traduccion:Object
	s: weak array of string
	archivos_idiomas: list of string
	linea: list of string
	traducciones: dict of string,string
	encontrado:bool=false
	idioma_aplicacion:string
	fpo: FileStream
	construct(s:string)
		idioma_aplicacion=s
	init
		archivos_idiomas= new list of string
		linea= new list of string
		traducciones= new dict of string,string
		s=Intl.get_language_names()
		// archivo para crear frases para traducr
		//fpo = FileStream.open(directorio_usuario+"/frases_po.txt","w")
		
	def traduce(idioma_traduccion:string="-")
		try
			var d = Dir.open( directorio_datos+"/po" )
			var name=""
			archivos_idiomas.clear()
			while ((name = d.read_name()) != null)
				archivos_idiomas.add(name.replace(".po",""))
			encontrado=false
			var archivo=""
			if idioma_traduccion!="-"
				if archivos_idiomas.contains(idioma_traduccion) 
					encontrado=true
					archivo=idioma_traduccion+".po"
					idioma_aplicacion=idioma_traduccion
			else
				for a in s
					if archivos_idiomas.contains(a) 
						encontrado=true
						archivo=a+".po"
						idioma_aplicacion=a
						break
					
			if encontrado
				//abrimos para coger los nombres
				var f = FileStream.open(directorio_datos+"/po/"+archivo,"r")
				var c=""
				linea.clear()
				c=f.read_line()
				linea.add(c)
				while not f.eof()
					c=f.read_line()
					if c!=null do linea.add(c)
					
				for var i=0 to ultimo_de_lista(linea)
					if linea[i].length>5 
						if (linea[i][0:5]=="msgid")
							linea[i]= linea[i].replace("msgid ","")
							linea[i]= linea[i].replace("msgid","")
							linea[i]= Shell.unquote (linea[i])
							if i<ultimo_de_lista(linea)
								linea[i+1]= linea[i+1].replace("msgstr ","")
								linea[i+1]= linea[i+1].replace("msgstr","")
								linea[i+1]= Shell.unquote (linea[i+1])
								traducciones.set(linea[i],linea[i+1])
		except
			print "error"
			
	def t(s:string):string // traduce y convierte a mayusculas o minusculas
		var r=s
		if encontrado do r=traducciones[s] // si se encontro idioma traduce
		if (r==null) and (s!=null) do r=s  // si no ha traducido a nada escribe la frase por defecto.
		return r
