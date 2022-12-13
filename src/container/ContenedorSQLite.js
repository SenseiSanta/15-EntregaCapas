import knex from 'knex'
import { configSQLite } from '../utils/config.js'

export class ContenedorSQLite {
    constructor(tableName){
        this.knexCli = knex(configSQLite.db);
        this.tableName = tableName;
    }

    async getAll(){
        try {
            return await this.knexCli.from(this.tableName).select('*')
        } catch (error) {
            throw error
        }
    }

    async updateById(id, obj){
        try {
            return await this.knexCli.from(this.tableName).where({id: id}).update(obj);
        } catch (error) {
            throw error
        }
    }

    async getById(id){
        try {
            return await this.knexCli.from(this.tableName).select('*').where({id: id})
        } catch (error) {
            throw error
        }
    }

    async deleteById(id){
        try {
            return await this.knexCli.from(this.tableName).where({id: id}).del();
        } catch (error) {
            throw error
        }
    }

    async save(obj){
        return await this.knexCli(this.tableName).insert(obj)
    }

    async deleteAll(){
        try {
            return await this.knexCli.from(this.tableName).del();
        } catch (error) {
            throw error
        }
    }

    async cerrarConexion() {
        this.knexCli.destroy();
    }

}