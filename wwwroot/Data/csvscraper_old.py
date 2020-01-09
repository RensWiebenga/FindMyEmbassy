from bs4 import BeautifulSoup
import requests
import csv
import urllib
import unicodedata
import json

def strip_accents(s):
   return ''.join(c for c in unicodedata.normalize('NFD', s)
                  if unicodedata.category(c) != 'Mn')

list_of_countries_url = "https://www.rijksoverheid.nl/onderwerpen/ambassades-consulaten-en-overige-vertegenwoordigingen/overzicht-landen-en-gebieden"
source = requests.get(list_of_countries_url).text
soup = BeautifulSoup(source, 'lxml')

#print(soup)
list_of_countries = soup.find('div', class_='topics')
#print(list_of_countries)
csv_file = open('scrape.csv', 'w')
csv_writer = csv.writer(csv_file)

for countries in list_of_countries.find_all('li'):
	country_a_element = countries.find("a")
	
	country_name = country_a_element.text
	if(country_name != "China" and country_name != "Macau SAR"):
		country_name_clean = strip_accents(country_a_element.text.replace(" ", "-"))
	
		country_url = "https://www.nederlandwereldwijd.nl/landen/"+country_name_clean.lower()+"/over-ons"
		print(country_name_clean)
		source2 = requests.get(country_url).text
		soup2 = BeautifulSoup(source2, 'lxml')
		

		for link_of_embassy_information in soup2.find_all('div', attrs={'class': 'representation'}):
			link_of_embassy_information_url = "https://www.nederlandwereldwijd.nl"+link_of_embassy_information.find('a').get('href')
			#print(link_of_embassy_information_url)
			#url = "https://www.nederlandwereldwijd.nl/landen/afghanistan/over-ons/ambassade-in-kabul"
			source = requests.get(link_of_embassy_information_url).text

			soup = BeautifulSoup(source, 'lxml')

			#country = link_of_embassy_information_url.split('/')[4]
			embassyinfo = soup.find('div', class_='embassy-info')
			name_embassador = ""
			phone_embassy = ""

			

			for dldata in embassyinfo.find_all('dt'):
				
				myheader = dldata.text.strip()
				if myheader == "Ambassadeur":
					name_embassador = dldata.findNext('dd').text.lstrip()
					#print(myheader)
				if myheader == "Adres":
					address_embassy = dldata.findNext('dd').text.lstrip()
				
				if myheader == "Telefoon":
					phone_embassy = dldata.findNext('dd').text.lstrip()
					#print(myheader)
				if myheader == "E-mail":
					e_mail_embassy = dldata.findNext('dd').text.lstrip()
					#print(myheader)
				if myheader == "Openingstijden":
					opening_hours_embassy = dldata.findNext('dd').text.lstrip()
					#print(myheader)
			'''
			print(country_name_clean)
			print(name_embassador)
			print(phone_embassy)	
			print(e_mail_embassy)
			print(opening_hours_embassy)
			print("______________")
			'''
			


			csv_writer.writerow([country_name,name_embassador,address_embassy,phone_embassy,e_mail_embassy,opening_hours_embassy])
			#csv_writer.writerow([country_name])
		



	
'''
url = "https://www.nederlandwereldwijd.nl/landen/afghanistan/over-ons/ambassade-in-kabul"
source = requests.get(url).text

soup = BeautifulSoup(source, 'lxml')

country = url.split('/')[4]
embassyinfo = soup.find('div', class_='embassy-info')
name_embassador = ""
phone_embassy = ""

print(country)
for dldata in embassyinfo.find_all('dt'):
	
	myheader = dldata.text.strip()
	if myheader == "Ambassadeur":
		name_embassador = dldata.findNext('dd').text.lstrip()
		#print(myheader)
	if myheader == "Telefoon":
		phone_embassy = dldata.findNext('dd').text.lstrip()
		#print(myheader)
	if myheader == "E-mail":
		e_mail_embassy = dldata.findNext('dd').text.lstrip()
		#print(myheader)
	if myheader == "Openingstijden":
		opening_hours_embassy = dldata.findNext('dd').text.lstrip()
		#print(myheader)

	
print(name_embassador)
print(phone_embassy)	
print(e_mail_embassy)
print(opening_hours_embassy)

csv_file = open('scrape.csv', 'w')
csv_writer = csv.writer(csv_file)


csv_writer.writerow([country,name_embassador,phone_embassy,e_mail_embassy,opening_hours_embassy])
'''
