# webapp_inventory_WS2019
A project for lectures Web Application Development and Projectmanagement WS2019.

## Developer
- FRANZ Lea
- LEITNER Florian
- OSWALD George
- OTT Clemens
- TRUMMER Julia
- WIESER Stefanie

## Get Started
- Create `.env` file. Template: `.env.default`
- Install node modules: ``npm install``
- Run server: ``node index.js``

## Scrum sprint 1
Scrum master: OSWALD George

### Userstory 1: List overview
An employee wants to have access to a current overview list. This overview list should include 
selected data about current needed data sets. In special cases the office management want to access this list 
on a mobile device or they want to print those list.

- Lisa wants to provide a list of current class for e.g. lecturers.
- Norbert wants to get a room list for his maintenance work.

Currently only trained employees are able to extend data source, e.g. to add new data sets to a specific file format.

### Userstory 2: Search
The amount of data will increase really fast. Lisa and Norbert want 
an easy way to get only a subset of data. Lists will be too long to work efficiantly, if they include all datasets,
e.g. all participants count about 4500. A search field in the overview is necessary to show only matching results.
 
- Lisa most search request is to look for participants of a selected course.
- Norbert has to know which rooms were maintained first, because they are regulary maintained(light, paint, windows, ...).

### Userstory 3: Inserting new data
Norbert and Lisa want to insert all in formation into the new course management system. 
It's necessary that both are able to add new data, because it's faster and less work 
to directly insert, and also state-of-the-art. Lisa and Norbert want to get access to an 
overview. There they want to search data, before they insert any duplicated entries.

## Scrum sprint 2
Scrum master: 

### Userstory 4: Persistent data
The course management system should easily extendable. First draft of inserting new data
looks quite good. At the next step it's important, that normal office users should be able to store 
data without any special(IT) knowledge. Inserting new data should be as easy as listing/requesting/showing 
existing data. Inspecial, Norbert needs to edit any data on his smartphone. 
Lisa has to access in formation on a tablet, e.g. the registration of new participants. 
Any employee of the office management has to take care, that only not existing data will be inserted 
into the course management system (no duplicated data). Basic checks have to be done by the system itself.

### Userstory 5: Edit single dataset 
Lisa gets a lot of requests to change existing data every day, because of old deprecated information. 
Lisa wants to change the content of single fields and save the new information.

(credit to michael ulm for providing user stories information)

### Testing criteria:
- Testprotocol
- Manual Browser testing
- W3C valid https://validator.w3.org/
- NoErrors in web developerview(console)


