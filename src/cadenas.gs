/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 * 
 */
uses
	Gee
	GLib
	
lista_sp:string
letras_conacento: new array of string
letras_sinacento: new array of string

def toma_cadena (a:string,i :int,f:int=-1):string // i es el punto inicial empezando de 0 y f es el punto final (no el avance)
	b: string
	
	var bu = new StringBuilder ();
	if f==-1
		bu.append_unichar(a.get_char(a.index_of_nth_char(i)))
		b=bu.str
	else
		if f>0
			var p=i
			while p<f
				bu.append_unichar(a.get_char(a.index_of_nth_char(p)))
				p++
			b=bu.str
		else
			b=""
	return b

def busca_char (a:string,b:char,i:int=0,adelante:bool=true):int
	
	var r=-1
	if adelante==true
		var c = i
		while c <= ultima(a)
			if a.get_char(a.index_of_nth_char(c))==b
				r=c
				break
			c++
	else
		var c = i
		while c >= 0
			if a.get_char(a.index_of_nth_char(c))==b
				r=c
				break
			c--
	
	return r 


def busca_cadena (a:string,b:string,i:int=0,adelante:bool=true):int
	var r=-1
	var coincide=0
	c:int =0
	if (longitud(b) == 0) or (longitud(a)==0)
		return r
	else
		if adelante==true
			for c = i to ultima(a)
				coincide=0
				for var h =0 to ultima(b)
					if a.get_char(a.index_of_nth_char(c+h))==b.get_char(b.index_of_nth_char(h))
						coincide++
					else
						break
						
				if coincide == longitud(b)
					r=c
					break
		else
			c=i
			while c >=0
				coincide=0
				for var h =0 to ultima(b)
					if a.get_char(a.index_of_nth_char(c+h))==b.get_char(b.index_of_nth_char(h))
						coincide++
					else
						break
				if coincide == longitud(b)
					r=c
					break
				c--
				
		return r


def cuenta (s:string,c:string):int
	var cantidad=0
	var pos=0
	var salir=false
	while not salir
		var busqueda= busca_cadena(s,c,pos)
		////print< "en "+s+" esta en posicion "+busqueda.to_string()
		
		if busqueda==-1 
			salir=true
		else
			pos=busqueda+longitud(c)
			cantidad++
			
	return cantidad
	
	
	
	
	
	
def valida_sp(s:string):bool
	lista_sp="abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZâêîôûÂÊÎÔÛáéíóúàèìòùÀÈÌÒÙüÁÉÍÓÚÜÇç?¿=)(/!ª'¡º1234567890-.,;:_{}[]*+-<> "
	r:bool=false
	for var i=0 to ultima(s)
		var n= toma_cadena(s,i,i+1)
		if n in lista_sp 
			r=true
		else
			r= false
			
	return r

	
def longitud (a:string):int
	return a.char_count()

def ultima (a:string):int
	return (a.char_count()-1)

def transforma_sinacento(palabra:string):string
	var r=palabra
	letras_conacento={"á","é","í","ó","ú","ñ","ü"}
	letras_sinacento={"_a","_e","_i","_o","_u","_n","0u"}
	for var x=0 to 6
		if letras_conacento[x] in r
			r=r.replace(letras_conacento[x],letras_sinacento[x])
	return r

def transforma_conacento(palabra:string):string
	 var r=palabra
	letras_conacento={"á","é","í","ó","ú","ñ","ü"}
	letras_sinacento={"_a","_e","_i","_o","_u","_n","0u"}
	for var x=0 to 6
		if letras_sinacento[x] in r
			r=r.replace(letras_conacento[x],letras_conacento[x])
	return r

def ultimo_de_lista(s:Collection):int 
	return s.size-1
		
def tamano_de_lista(s:Collection):int 
	return s.size

def lista_vacia(s:Collection):bool 
	return s.size==0
	
def array_vacio(s:array of string[]):bool 
	return s.length==0


def ultimo_de_array(s:array of string[]):int
	return (s.length-1)

def tamano_de_array(s:array of string[]):int
	return (s.length)

def convertir_array_en_lista(s:array of string[],ref c:list of string)
	c.clear()
	for var i=0 to ultimo_de_array(s)
		c.add(s[i])
		
def convierte_array_en_lista(s:array of string[]):list of string
	var lista= new list of string
	for var i=0 to ultimo_de_array(s)
		lista.add(s[i])
	return lista

	
def array_str_contiene(a:array of string[],s:string):bool
	var r=false
	for var i=0 to ultimo_de_array(a)
		if a[i]==s
			r=true
			break
	return r
def es_mayuscula(s:string):bool
	
	var mayuscula="ABCDEFGHIJKLMNÑOPQRSTUVWXYZÂÊÎÔÛÀÈÌÒÙÁÉÍÓÚÜÇ1234567890-.,;:_{}[]*+-<> "
	r:bool=true
	for var i=0 to ultima(s)
		var n= toma_cadena(s,i)
		if not (n in mayuscula) 
			r= false
			break
	return r

def esta_dentro(lista:string,s:string):bool
	
	r:bool=true
	for var i=0 to ultima(s)
		var n= toma_cadena(s,i)
		if not (n in lista) 
			r= false
			break
	return r

def tostring(longi:int,numero:int):string
	var r1= ""
	var r2=""
	var l=0
	r1=numero.to_string()
	l=longi-longitud(r1)
	if l>-1 do r2=string.nfill( l,'0')
	
	return r2+numero.to_string()
	
def desordena_lista_int (ref lista:list of int )
	for var i=0 to (ultimo_de_lista(lista))
		var lugar=Random.int_range(0,tamano_de_lista(lista))
		var a=lista[lugar]
		var b=lista[i]
		lista[lugar]=b
		lista[i]=a

def desordena_lista_string (ref lista:list of string )
	for var i=0 to (ultimo_de_lista(lista))
		var lugar=Random.int_range(0,tamano_de_lista(lista))
		var a=lista[lugar]
		var b=lista[i]
		lista[lugar]=b
		lista[i]=a
		
def desordena_array_string (ref lista:array of string[] )
	for var i=0 to (ultimo_de_array(lista))
		var lugar=Random.int_range(0,tamano_de_array(lista))
		var a=lista[lugar]
		var b=lista[i]
		lista[lugar]=b
		lista[i]=a
		

def contiene_en_array_str(a:array of string,s:string):bool	
	var r=false
	for x in a
		if s==x do r=true 
	return r
def index_en_array_str (a:array of string,s:string):int
	var r=-1
	for var x=0 to ultimo_de_array(a)
		if s==a[x]
			r=x
			break
 
	return r


def inserta_letra(s:string,sub:string,pos:int):string
	var r=""
	if (pos < longitud(s)) and (pos>=0)
		r=toma_cadena(s,0,pos)+ toma_cadena(sub,0,1)+ toma_cadena(s,pos+1,longitud(s))
	return r

def inserta_cadena(s:string,sub:string,pos:int):string
	var r=""
	if (pos < longitud(s)) and (pos>=0)
		r=toma_cadena(s,0,pos)+ toma_cadena(sub,0,longitud(sub))+ toma_cadena(s,pos+1,longitud(s))
	return r

def sobrescribe_letra(s:string,sub:string,pos:int):string
	var r=""
	if (pos < longitud(s)) and (pos>=0)
		r=toma_cadena(s,0,pos)+ toma_cadena(sub,0,longitud(sub))+ toma_cadena(s,pos+1+ultima(sub),longitud(s))
	return r


def toma_letra(s:string,pos:int):string
	var r=""
	if (pos <= ultima(s)) and (pos>=0)
		r= toma_cadena(s,pos,pos+1)
	return r
	
def borra_letra(s:string,pos:int):string
	var r=""
	if (pos <= ultima(s)) and (pos>=0)
		r= toma_cadena(s,0,pos)+ toma_cadena(s,pos+1,longitud(s))
	return r

def desordena_string(s:string):string
	var r=s
	for var i=0 to (ultima(r)*2)
		var lugar=Random.int_range(0,ultima(r))
		var letra= toma_letra(r,lugar)
		var x=borra_letra(r,lugar)
		r=x+letra
	return r

def selecciona_item_str_azar (lista:list of string):string
	return lista[Random.int_range(0,tamano_de_lista(lista))]

def selecciona_item_str_azar_array (lista:array of string):string
	return lista[Random.int_range(0,tamano_de_array(lista))]
		
def num_entre (num:int,bajo:int,alto:int):bool
	return (num>=bajo) and (num<=alto)

def copia_lista_str (lista1:list of string):list of string
	r: list of string;
	r= new list of string
	for var i=0 to ultimo_de_lista(lista1)
		r.add(lista1[i])
	return r
	
def listar_str (l:list of string)
	for var i=0 to ultimo_de_lista(l)
		print l[i]

def listar_int (l:list of int)
	for var i=0 to ultimo_de_lista(l)
		print l[i].to_string()
def junta (s:string,l:list of string):string
	var r=""
	if tamano_de_lista(l)>0
		for var i=0 to (ultimo_de_lista(l)-1)
			r+=l[i]+s
		r+=l[ultimo_de_lista(l)]
	return r

def add_str_sin_repetir(s:string,l:list of string):list of string
	var esta=false
	for var i=0 to ultimo_de_lista(l)
		if (l[i]==s) do esta=true
	l.add(s)
	return l

def convierte_array_str_en_lista_int(a:array of string[]): list of int
	var r= new list of int
	for var i=0 to ultimo_de_array(a)
		//print a[i]
		r.add(int.parse(a[i]))
	return r
	
def convierte_lista_int_en_lista_str(a:list of int): list of string
	var r= new list of string
	for var i=0 to ultimo_de_lista(a)
		r.add(a[i].to_string())
	return r

