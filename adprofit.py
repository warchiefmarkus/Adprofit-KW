# -*- coding: utf-8 -*-

import sys, os, ctypes, time
from selenium import webdriver

user32 = ctypes.windll.user32
screensize = user32.GetSystemMetrics(0), user32.GetSystemMetrics(1)
current_path = os.path.dirname(os.path.realpath(__file__))

#crome options
chrome_options = webdriver.ChromeOptions() 
#chrome_options.add_argument("user-data-dir=C:/Users/user/AppData/Local/Google/Chrome/User Data/Default") 
#crome chache dir with cookies
#chrome_options.add_argument("user-data-dir="+os.path.join(current_path,"crome-cache")) 
chrome_options.add_argument("user-data-dir=C:/crome-cache") 
#path to extension adv
chrome_options.add_argument("load-extension="+os.path.join(current_path,"adv")) 
#disable images
#prefs = {"profile.managed_default_content_settings.images":1}
#chrome_options.add_experimental_option("prefs",prefs)

browser1 = webdriver.Chrome(chrome_options=chrome_options)
browser1.set_page_load_timeout(80)#timeout
#browser1.set_window_position(screensize[0],0)
browser1.set_window_position(0,0)
browser1.set_window_size(screensize[0],screensize[1])

def scroll_until_loaded():
    check_height = browser1.execute_script("return document.body.scrollHeight;")

    while (browser1.execute_script("return window.innerHeight+window.pageYOffset;")  < check_height):
        browser1.execute_script("window.scrollBy(0, window.innerHeight);")
        time.sleep(3)

with open('links.txt') as f:
    lines = f.readlines()   

for link in lines:
    try :
        print("site " + link)
        browser1.get(link)
        scroll_until_loaded()
        for x in range(1, len(browser1.window_handles)):
            browser1.close();
            browser1.switch_to.window(browser1.window_handles[0])
    except :
        print("Page time out! open next")
        
print("exit final")
browser1.quit()
sys.exit()    
    

from bs4 import BeautifulSoup
import requests
import sys, os, ctypes, time
from selenium import webdriver
from selenium.webdriver.common.by import By

chrome_options = webdriver.ChromeOptions() 
chrome_options.add_argument("user-data-dir=C:/crome-cache") 
chrome_options.add_argument("load-extension="+os.path.join(current_path,"adv")) 
browser1 = webdriver.Chrome(chrome_options=chrome_options)
browser1.set_page_load_timeout(80)#timeout
browser1.set_window_position(0,0)
browser1.set_window_size(screensize[0],screensize[1])
link = "https://www.google.ru/search?hl=ru&q=модинг+сайты"
browser1.get(link)


elements = browser1.find_elements(By.CSS_SELECTOR,"cite")
for i in elements: 
    if (i.text.startswith('https://')|i.text.startswith('http://')):
        print (i.text)
    else:
        print ("http://"+i.text)


#chrome_options2 = webdriver.ChromeOptions() 
#chrome_options2.add_argument("user-data-dir=C:/some2") 
#chrome_options2.add_argument("load-extension=C:/adv") 
#
#browser2 = webdriver.Chrome(chrome_options=chrome_options2)
#browser2.set_window_position(0,screensize[1])
#browser2.set_window_size(screensize[0],screensize[1])


#
#webdriver.DesiredCapabilities.FIREFOX['proxy'] = {
#    "httpProxy":PROXY,
#    "ftpProxy":PROXY,
#    "sslProxy":PROXY,
#    "noProxy":None,
#    "proxyType":"MANUAL",
#    "class":"org.openqa.selenium.Proxy",
#    "autodetect":False
#}

# you have to use remote, otherwise you'll have to code it yourself in python to 
#driver = webdriver.Remote("http://localhost:4444/wd/hub", webdriver.DesiredCapabilities.FIREFOX)
   
        
        
