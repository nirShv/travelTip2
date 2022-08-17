export const mapService = {
    initMap,
    addMarker,
    panTo,
    getPlaces,
    getGeoLocation,
    removeLoc
}

import { utilsService } from './utils.js'
import { storageService } from './storage.service.js'
import { appController } from '../app.controller.js'

// Var that is used throughout this Module (not global)
const STORAGE_KEY = 'places'
let gMap
let gPlaces = storageService.load(STORAGE_KEY) || []



function initMap(lat = 32.0749831, lng = 34.9120554) {
    console.log('InitMap')
    return _connectGoogleApi()
        .then(() => {
            console.log('google available')
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15
            })
            console.log('Map!', gMap)

            gMap.addListener('click', (mapsMouseEvent) => {
                const lat = mapsMouseEvent.latLng.lat()
                const lng = mapsMouseEvent.latLng.lng()
                const position = { lat, lng }

                const locationName = prompt('Enter location name')
                if (locationName) {
                    onAddPlace(position, locationName)

                    new google.maps.Marker({
                        position: position,
                        map: gMap,
                    })
                }
                appController.renderLocs()
            })
        })
}

function addMarker(loc) {
    var marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        title: 'Hello World!'
    })
    return marker
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng)
    gMap.panTo(laLatLng)
}


function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = 'AIzaSyAumIxeXD96iDEVcmHW74JGeIxq0ryRg8Y'
    var elGoogleApi = document.createElement('script')
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    elGoogleApi.async = true
    document.body.append(elGoogleApi)

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}

function onAddPlace(pos, name) {
    addPlace(pos, name)
    // renderPlaces()
}

function addPlace(pos, name) {
    gPlaces.push({ id: utilsService.makeId(3), pos, name })
    storageService.save(STORAGE_KEY, gPlaces)
}

function getPlaces() {
    return storageService.load(STORAGE_KEY)
}

function getGeoLocation(val) {
    var str = val.replace(' ', '+')
    const GEO_API = `https://maps.googleapis.com/maps/api/geocode/json?address=${str}&key=AIzaSyCTggHj3ZacaigFcNiLyQKvEjeiZCspxwc`
    return axios.get(GEO_API)
        .then(res => ({
            name: res.data.results[0].formatted_address,
            lat: res.data.results[0].geometry.location.lat,
            lng: res.data.results[0].geometry.location.lng
        }))
}

function removeLoc(locId) {
    const locIdx = gPlaces.findIndex(loc => loc.id === locId)
    gPlaces.splice(locIdx, 1)
    storageService.save(STORAGE_KEY, gPlaces)
}