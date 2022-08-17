import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'

export const appController = {
    renderLocs
}

window.onload = onInit
window.onAddMarker = onAddMarker
window.onPanTo = onPanTo
window.onGetLocs = onGetLocs
window.onGetUserPos = onGetUserPos
window.onSubmit = onSubmit
window.onRemoveLoc = onRemoveLoc
window.onCopyLocation = onCopyLocation

function onInit() {
    mapService.initMap()
        .then(() => {
            console.log('Map is ready')
            renderFilterByQueryStringParams()

        })
        .catch(() => console.log('Error: cannot init map'))
    renderLocs()
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
    console.log('Getting Pos')
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function onAddMarker() {
    console.log('Adding a marker')
    mapService.addMarker({ lat: 32.0749831, lng: 34.9120554 })
}

function onGetLocs() {
    locService.getLocs()
        .then(locs => {
            console.log('Locations:', locs)
            document.querySelector('.locs').innerText = JSON.stringify(locs, null, 2)
        })
}

function onGetUserPos() {
    getPosition()
        .then(pos => {
            console.log('User position is:', pos.coords)
            document.querySelector('.user-pos').innerText =
                // `Latitude: ${pos.coords.latitude} - Longitude: ${pos.coords.longitude}`
                `Your Location`
                mapService.panTo(pos.coords.latitude,pos.coords.longitude)
                mapService.addMarker({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        })
        .catch(err => {
            console.log('err!!!', err)
        })
}
function onPanTo(lat, lng) {
    console.log('Panning the Map')
    // mapService.panTo(35.6895, 139.6917)
    mapService.panTo(lat, lng)
}

function renderLocs() {
    const places = mapService.getPlaces()
    console.log(places)
    let strHTMLs = places.map(place =>
        `<li>
            <span><span class="list-item">Name:</span> ${place.name}</span>
            <span><span class="list-item">LAT: </span> ${place.pos.lat}</span>
            <span><span class="list-item">LAG: </span>${place.pos.lng}</span>
        </li>
        <div>
        <span class="list-item move-to" onclick="onPanTo('${place.pos.lat}', '${place.pos.lng}')">Move There</span>
        <span class="btn btn-del" onclick="onRemoveLoc('${place.id}')">X</span>
        </div>`
    )
    document.querySelector('.locs-list').innerHTML = strHTMLs.join('')
}
// onSubmit('tel aviv')
function onSubmit(ev) {
    if (ev) ev.preventDefault()
    const elInputSearch = document.querySelector('.search')
    // console.log('ev',ev);
    // const val=ev.target.value
    const val = elInputSearch.value
    elInputSearch.value = ""
    console.log('val', val);
    mapService.getGeoLocation(val).then(res => {
        mapService.panTo(res.lat, res.lng)
        mapService.addMarker({ lat: res.lat, lng: res.lng })
        mapService.addPlace({ lat: res.lat, lng: res.lng }, val)
        renderLocs()
        changeSearchParams(res.name, res.lat, res.lng)
        document.querySelector('.user-pos').innerText = val
    })
}

function changeSearchParams(name, lat, lng) {
    const queryStringParams = `?name=${name}&lat=${lat}&lng=${lng}`
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryStringParams
    window.history.pushState({ path: newUrl }, '', newUrl)
}

function onRemoveLoc(locId) {
    mapService.removeLoc(locId)
    renderLocs()
}

function renderFilterByQueryStringParams() {
    const queryStringParams = new URLSearchParams(window.location.search)
    const filterBy = {
        lat: +queryStringParams.get('lat') || '',
        lng: +queryStringParams.get('lng') || ''
    }

    if (!filterBy.lat && !filterBy.lng) return

    console.log('filterBy', filterBy);
    mapService.panTo(filterBy.lat, filterBy.lng)
    mapService.addMarker(filterBy)
}

function onCopyLocation() {
    const queryStringParams = new URLSearchParams(window.location.search)
    const url = `https://nirshv.github.io/travelTip2/?${queryStringParams}`
    navigator.clipboard.writeText(url)
}