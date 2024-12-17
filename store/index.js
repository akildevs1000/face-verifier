export const state = () => ({
    isDone: false,
});

export const mutations = {
    SET_IS_DONE(state, payload) {
        state.isDone = payload;
    },
};
