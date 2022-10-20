<img src="https://ae.studio/img/ae.studio-logo.png" width="200"/>

Made with ♥️ by <a style="display:flex; align-items: center; width: 100%; justify-content: center; gap: 15px; color: #fff !important; text-decoration:none" href="https://ae.studio/">AE Studio</a>

# Table Explorer

- This project has been created by [AE STUDIO](https://ae.studio) and is an admin tool for [Tableland](https://tableland.xyz/), which is a relational database for web3 natives. With this tool you will be able to see your tables, create new ones, read, insert, update and delete entries from them!

- [Take a look on the last deployed version here!](https://tableexplorer.com/)

## How to start

1. First of all, login with your polygon wallet. Make sure to be on **Mumbai testnet**
2. Add a new table by clicking in (+ Add Table)
3. Now define your database columns and choose a table prefix, then click in **Create Table**
4. Nice! Now you will see your table listed on the left sidebar, by clicking on it you will be able to run queries, add stuff and change permissions! More information on [Tableland docs](https://docs.tableland.xyz/)

## How to run this Project locally

- Install the dependencies:
  `npm install` Or `yarn`

- Copy the environment sample to a .env file

  ```sh
  NULLSTACK_PROJECT_NAME="Tableexplorer"
  NULLSTACK_PROJECT_DOMAIN="localhost"
  NULLSTACK_SERVER_PORT="3000"
  ```

- Run the app in development mode:

  `npm start` or `yarn start`

* Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

* The application uses IndexedDB to store imported databases.

## Contributing

- Feel free to create a Pull Request, someone will review it and (hopefully) merge it into the main branch, please follow the lint rules and show tests.

## AE STUDIO

- [Website](https://ae.studio)

## Learn more about Nullstack

- [Read the documentation](https://nullstack.app/documentation)

## Learn more about Tableland

- [Read the documentation](https://docs.tableland.xyz/)
