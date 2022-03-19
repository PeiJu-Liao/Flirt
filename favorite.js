"use strict"

const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users/"

let communityData = []
const flirtData = JSON.parse(localStorage.getItem('lovingData'))

const dataPanel = document.querySelector('.data-panel')
function renderList(data) {
  let renderHTML = ''
  data.forEach((user) => {
    renderHTML += `
    <div class="card mx-2 mb-3" style="width: 10rem;">  
      <img src="${user.avatar}" class="card-img-top" alt="...">
      <div class="card-body">
        <p class="card-text text-center"> ${user.name} ${user.surname} </p>
      </div>
      <div class="card-footer text-muted p-1" data-id="${user.id}">
        <button type="button" class="mx-3 btn btn-info btn-show-modal" data-bs-toggle="modal" data-bs-target="#exampleModal" data-id="${user.id}">More</button>
        <button type="button" class="add-favorite-btn btn btn-danger fas fa-trash-alt" data-id="${user.id}"></button>
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
  } else if (target.matches('.fa-trash-alt')) {
    removeFavorite(Number(target.dataset.id))
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

// TODO: 移除收藏功能 
function removeFavorite(id) {
  //錯誤處理: 一旦收藏清單為空的null，則中止程式
  if (!flirtData || !flirtData.length) return
  const removeIndex = flirtData.findIndex((user) => user.id === id)
  if (removeIndex === -1) return
  flirtData.splice(removeIndex, 1)
  localStorage.setItem('lovingData', JSON.stringify(flirtData))
  renderList(flirtData)
}

// TODO: "分頁"功能=> 目標每頁顯示10筆資料
// 分頁功能是：「依照被點擊到的頁碼，決定需要的資料範圍，顯示在畫面上。」
const FAORITE_PER_PAGE = 12
function getUsersByPage(page) {
  const startIndex = (page - 1) * FAORITE_PER_PAGE
  // 回傳切割後的新的數據資料，利用其陣列長度在去renderPage(陣列長度)渲染畫面
  return flirtData.slice(startIndex, startIndex + FAORITE_PER_PAGE)
}
function renderPage(amount) {
  let pageHTML = ''
  const totalPages = Math.ceil(amount / FAORITE_PER_PAGE)
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

renderList(getUsersByPage(1)) //渲染第一面的收藏清單
renderPage(flirtData.length)//依收藏數量渲染出--分頁數量



