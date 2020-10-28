const Kitting = httpVueLoader('./kitting.vue');
const Detail = httpVueLoader('./detail.vue');
const NotFound = httpVueLoader('./NotFound.vue');

export default {
    routes: [
        {
            path: '/',
            name: 'index',
            components: {
                default: Kitting,
            },
            props: true, 
        },
        {
            path: 'kit/:kit_name',
            name: 'kit_details',
            components: {
                default: Detail,
            },
            props: {
                default:true,
            },     
        },
        {
            path: "/:catchAll(.*)",
            component: NotFound,
        },
    ],
};
