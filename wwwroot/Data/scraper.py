from bs4 import BeautifulSoup
import requests
import csv
import urllib
import unicodedata
import json

def strip_accents(s):
	return ''.join(c for c in unicodedata.normalize('NFD', s)
		if unicodedata.category(c) != 'Mn')

data = {}
data['embassies'] = []
data['embassies'].append({
	'original_country_name': 'Nederland',
	'country_name': 'nederland',
	'name_embassador': '',
	'address_embassy': '',
	'phone_embassy': '',
	'e_mail_embassy': '',
	'opening_hours_embassy':'',
	'police':'112',
	'ambulance':'112',
	'fire':'112',
	'flag':'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/23px-Flag_of_the_Netherlands.svg.png',
	'country_number':'+31'
})

list_of_countries_url = "https://www.rijksoverheid.nl/onderwerpen/ambassades-consulaten-en-overige-vertegenwoordigingen/overzicht-landen-en-gebieden"
source = requests.get(list_of_countries_url).text
soup = BeautifulSoup(source, 'lxml')

#print(soup)
list_of_countries = soup.find('div', class_='topics')
#print(list_of_countries)
csv_file = open('scrape.csv', 'w')
csv_writer = csv.writer(csv_file)


source_country_numbers_html = requests.get("http://www.hallobuitenland.nl/landnummers").text
soup_country_numbers_html = BeautifulSoup(source_country_numbers_html, 'lxml')

source_emergency_numbers_html = requests.get("https://nl.qwertyu.wiki/wiki/List_of_emergency_telephone_numbers").text
soup_emergency_numbers_html = BeautifulSoup(source_emergency_numbers_html, 'lxml')

for countries in list_of_countries.find_all('li'):
	country_a_element = countries.find("a")
	lower_country_a_element = str(country_a_element.text).lower()
	country_name = lower_country_a_element.replace('-',' ')

	original_country_name = country_a_element.text
	#print(original_country_name)
	

	if(country_name != "china" and country_name != "macau sar" and country_name != "mauritius"):
		

		
		selected_list_items = soup_country_numbers_html.select(".tarieven td")

		for link in selected_list_items:
			selected_country_name = link.find('a')
			if(selected_country_name):
				
				clean_selected_country_name = selected_country_name.text.replace('Landnummer van ','').replace('-','').lower()
				if(clean_selected_country_name == country_name):
					
					print("clean_selected_country_name "+ clean_selected_country_name)
					country_number = selected_country_name.parent.findNext('td').text.replace('00','+')
					print(country_number)
					
					



		#print(country_name)
		
		police_number = ""
		ambulance_number = ""
		fire_number = ""
		selected_links = soup_emergency_numbers_html.select(".wikitable a")
		for link in selected_links:
			
			if(country_name == link.text.lower()):

				

				flag = link.parent.find("img")['src']

				#print(flag)
				police = link.parent.findNext('td')

				if(police.has_attr('colspan') and police['colspan']=="3"):
					police_number = police.text.strip()
					ambulance_number = police.text.strip()
					fire_number = police.text.strip()

				elif(police.has_attr('colspan') and police['colspan']=="2"):
					police_number = police.text.strip()
					ambulance_number = police.text.strip()
					fire_number = police.parent.findNext('td').findNext('td').text.strip()

				elif(police.parent.findNext('td').findNext('td').findNext('td').has_attr('colspan') and police.parent.findNext('td').findNext('td').findNext('td')['colspan']=="2"):
					police_number = police.text.strip()
					ambulance_number = police.parent.findNext('td').findNext('td').findNext('td').text.strip()
					fire_number = police.parent.findNext('td').findNext('td').findNext('td').text.strip()
				else:
					police_number = police.text.strip()
					ambulance_number = police.parent.findNext('td').findNext('td').findNext('td').text.strip()
					#print(police.parent.findNext('td').findNext('td').findNext('td').findNext('td'))
					fire_number = police.parent.findNext('td').findNext('td').findNext('td').findNext('td').text.strip()
					#print(police.parent.findNext('td').findNext('td').findNext('td'))
				
		
	

		country_name_clean = strip_accents(country_name.replace(" ", "-"))
		country_url = "https://www.nederlandwereldwijd.nl/landen/"+country_name_clean.lower()+"/over-ons"
		source_country_html = requests.get(country_url).text
		soup_country_html = BeautifulSoup(source_country_html, 'lxml')
		for link_of_embassy_information in soup_country_html.find_all('div', attrs={'class': 'representation'}):
			link_of_embassy_information_url = "https://www.nederlandwereldwijd.nl"+link_of_embassy_information.find('a').get('href')
			#print(country_name)
			source = requests.get(link_of_embassy_information_url)
			
			soup = BeautifulSoup(source.text, 'lxml')

			
			embassyinfo = soup.find('div', class_='embassy-info')
			name_embassador = ""
			phone_embassy = ""

			

			for dldata in embassyinfo.find_all('dt'):
				
				myheader = dldata.text.strip()
				if myheader == "Ambassadeur":
					name_embassador = dldata.findNext('dd').text.lstrip()
					#print(myheader)
				if myheader == "Adres":
					address_embassy = dldata.findNext('dd').get_text(separator=" ").strip()
								
				if myheader == "Telefoon":
					phone_embassy = dldata.findNext('dd').text.lstrip()
					#print(myheader)
				if myheader == "E-mail":
					e_mail_embassy = dldata.findNext('dd').text.lstrip()
					#print(myheader)
				if myheader == "Openingstijden":
					opening_hours_embassy = dldata.findNext('dd').text.lstrip()
					#print(myheader)

			

			data['embassies'].append({
				'original_country_name': original_country_name,
				'country_name': country_name,
				'name_embassador': name_embassador,
				'address_embassy': address_embassy,
				'phone_embassy': phone_embassy,
				'e_mail_embassy': e_mail_embassy,
				'opening_hours_embassy':opening_hours_embassy,
				'police':police_number,
				'ambulance':ambulance_number,
				'fire':fire_number,
				'flag':flag,
				'country_number':country_number
			})

			with open('embassies.json', 'w') as outfile:
				json.dump(data, outfile)
			
		



