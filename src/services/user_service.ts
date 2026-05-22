import type { userModel } from '@/models/userModel'
import { apiCaule } from './apiCaule'





export const userService = {



    async getAll(): Promise<userModel[]> {
        const { data } = await apiCaule.get<userModel[]>('/usuarios/all')
        console.log('antes de carregar usuarios de online p local')

        console.log('depois de carregar usuarios de online p local')
        console.log('data')
        console.log(data)
        return data
    },

    async getLogin(user: userModel): Promise<userModel[]> {

        const pass = btoa("@vlog@" + user.login + ":@vpass@" + user.senha);

        const { data } = await apiCaule.get<userModel[]>('/usuario/login/' + pass)
        console.log('depois log usuario')


        console.log('data')
        console.log(data)
        return data
    },



}
