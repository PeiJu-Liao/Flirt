"use strict"

const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users/"

let communityData = []
let searchData = []
let list = JSON.parse(localStorage.getItem('lovingData')) || []

axios.get(INDEX_URL)
  .then((response) => {
    console.log(response.data.results);
    communityData.push(...response.data.results)
    renderList(getUsersByPage(1))
    renderPage(communityData.length)
  })
  .catch((erro) => {
    console.log(erro);
  })

// 將名單資料輸入data-panel
const dataPanel = document.querySelector('.data-panel')
function renderList(data) {
  let renderHTML = ''
  data.forEach((user) => {
    const id = user.id
    const className = list.some((user) => user.id === id) ? "btn-danger" : "btn-warning"

    renderHTML += `
    <div class="card mx-2 mb-3" style="width: 10rem;">
      <img src="${user.avatar}" class="card-img-top" alt="...">
      <div class="card-body">
        <p class="card-text text-center"> ${user.name} ${user.surname} </p>
      </div>
      <div class="card-footer text-muted p-1" id="${user.id}">
        <button type="button" class="mx-3 btn btn-info btn-show-modal" data-bs-toggle="modal" data-bs-target="#exampleModal" data-id="${user.id}">More</button>
        <button type="button" class="add-favorite-btn btn ${className} far fa-heart" data-id="${id}"></button>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = renderHTML
}

// TODO: 瀏覽頁面點擊綁定操作連結到各種頁面功能 onPanelClick 
const onPanelClick = function (event) {
  let target = event.target
  if (target.matches('.btn-show-modal')) {
    showUserDetails(Number(target.dataset.id))
  } else if (target.matches('.add-favorite-btn')) {
    collectFavorite(Number(target.dataset.id))
    turnToRedHeart(target)
  }
}
dataPanel.addEventListener('click', onPanelClick)

//TODO: showModalDetails功能=>點擊more按紐，跳出更多user資訊 
function showUserDetails(id) {
  const nameTitle = document.querySelector('.name-title')
  const userModalImg = document.querySelector('.user-modal-img')
  const userModalName = document.querySelector('.user-modal-name')
  const userModalAge = document.querySelector('.user-modal-age')
  const userModalBirth = document.querySelector('.user-modal-birth')
  const userModalEmail = document.querySelector('.user-modal-email')
  const userModalRegion = document.querySelector('.user-modal-region')

  axios.get(INDEX_URL + id).then(function (response) {
    const userDetails = response.data
    console.log(userDetails);
    nameTitle.innerText = `${userDetails.name} ${userDetails.surname}`
    userModalImg.src = userDetails.avatar
    userModalName.innerText = `Name: ${userDetails.name} ${userDetails.surname}`
    userModalAge.innerText = `Age: ${userDetails.age}`
    userModalBirth.innerText = `Birthday: ${userDetails.birthday}`
    userModalEmail.innerText = `Email: ${userDetails.email}`
    userModalRegion.innerText = `Region: ${userDetails.region}`
  })
}



// TODO: "收藏/移除收藏"功能 
function collectFavorite(id) {
  const flirtPerson = communityData.find((user) => user.id === id)
  const flirtPersonIndex = list.findIndex((user) => user.id === id)
  if (list.some((user) => user.id === id)) {
    // alert(`已收藏在清單裡!`)
    list.splice(flirtPersonIndex, 1)//重複者從Local數據刪除
  } else {
    list.push(flirtPerson)
  }
  localStorage.setItem('lovingData', JSON.stringify(list))
}

// TODO: 收藏者的愛心變成紅色的;反之..
function turnToRedHeart(target) {
  if (target.matches('.btn-warning')) {
    target.classList.remove('btn-warning')
    target.classList.add('btn-danger')
  } else {
    target.classList.remove('btn-danger')
    target.classList.add('btn-warning')
  }
}



// TODO: "搜尋"功能，綁監聽事件在searcg bar上
//使用者輸入關鍵字，比對數據裡每筆姓名，列出姓名重複者，重新渲染畫面
const searchBar = document.querySelector('#search-form')
const serachInput = document.querySelector('#search-input')
searchBar.addEventListener('submit', searchFunction)
function searchFunction(e) {
  e.preventDefault() //中指部分瀏覽器元素的預設行為
  const keyword = serachInput.value.trim().toLowerCase()

  searchData = communityData.filter((user) => {
    return user.name.trim().toLowerCase().includes(keyword)
  })
  // 沒有配對結果者，告知使用者沒有輸入沒有配對
  if (searchData.length === 0) {
    return alert(`The keyword you input [${keyword}] has no eligible users.`)
  }
  renderList(searchData) //搜尋結果重新渲染畫面
  renderPage(searchData.length) //搜尋結果也需要劃分頁面
  renderList(getUsersByPage(1)) //預設顯示第1頁的搜尋結果
}

// TODO: "分頁"功能=> 目標每頁顯示10筆資料
// 分頁功能是：「依照被點擊到的頁碼，決定需要的資料範圍，顯示在畫面上。」
const USERS_PER_PAGE = 12
function getUsersByPage(page) {
  const dividData = searchData.length ? searchData : communityData
  const startIndex = (page - 1) * USERS_PER_PAGE
  // 回傳切割後的新的數據資料，利用其陣列長度在去renderPage(陣列長度)渲染畫面
  return dividData.slice(startIndex, startIndex + USERS_PER_PAGE)
}
function renderPage(amount) {
  let pageHTML = ''
  const totalPages = Math.ceil(amount / USERS_PER_PAGE)
  let page = 1
  while (page <= totalPages) {
    pageHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    page++
  }
  pagePanel.innerHTML = pageHTML
}
const pagePanel = document.querySelector('.pagination')
pagePanel.addEventListener('click', onPagePanelClick)
function onPagePanelClick(event) {
  // 錯誤處理: 一旦點擊元素非<a>元素，結束程式
  if (event.target.tagName !== 'A') return
  const pageChosen = Number(event.target.dataset.page)
  return renderList(getUsersByPage(pageChosen))
}

