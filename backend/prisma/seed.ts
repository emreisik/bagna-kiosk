import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Categories
  console.log("📁 Creating categories...");
  const ustgiyim = await prisma.category.create({
    data: { name: "ustgiyim", displayName: "Üst Giyim" },
  });
  const altgiyim = await prisma.category.create({
    data: { name: "altgiyim", displayName: "Alt Giyim" },
  });
  const elbise = await prisma.category.create({
    data: { name: "elbise", displayName: "Elbise & Tulum" },
  });
  const takim = await prisma.category.create({
    data: { name: "takim", displayName: "Takım" },
  });
  console.log("✅ Categories created");

  // Create Subcategories
  console.log("📂 Creating subcategories...");
  const ceket = await prisma.subcategory.create({
    data: {
      name: "ceket",
      displayName: "Ceket & Yelek",
      categoryId: ustgiyim.id,
    },
  });
  const gomlek = await prisma.subcategory.create({
    data: {
      name: "gomlek",
      displayName: "Gömlek",
      categoryId: ustgiyim.id,
    },
  });
  const pantolon = await prisma.subcategory.create({
    data: {
      name: "pantolon",
      displayName: "Pantolon",
      categoryId: altgiyim.id,
    },
  });
  const elbiseSub = await prisma.subcategory.create({
    data: {
      name: "elbise",
      displayName: "Elbise",
      categoryId: elbise.id,
    },
  });
  const takimSub = await prisma.subcategory.create({
    data: {
      name: "takim",
      displayName: "Takım",
      categoryId: takim.id,
    },
  });
  console.log("✅ Subcategories created");

  // Create Products
  console.log("📦 Creating products...");

  // Product 1: Ekru Blazer
  await prisma.product.create({
    data: {
      title: "Ekru Tek Düğmeli Cepli Kadın Blazer Ceket",
      productCode: "1ya1ck0015-193",
      shortDesc: "Premium single-button blazer with pocket details in ecru",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: ustgiyim.id,
      subcategoryId: ceket.id,
      sizeRange: "36-42",
      price: "145$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 3,
          },
        ],
      },
    },
  });

  // Product 2: Bordo Gömlek
  await prisma.product.create({
    data: {
      title: "Bordo Kadın Gömlek",
      productCode: "1ya1gm0024-256",
      shortDesc: "Classic bordeaux shirt with refined tailoring",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: ustgiyim.id,
      subcategoryId: gomlek.id,
      sizeRange: "36-42",
      price: "78$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 3: Ekru Pantolon
  await prisma.product.create({
    data: {
      title: "Ekru Klasik Pantolon",
      productCode: "2165-192-26W101",
      shortDesc: "Classic tailored pants in ecru with refined fit",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: altgiyim.id,
      subcategoryId: pantolon.id,
      sizeRange: "36-42",
      price: "95$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 4: Bej Elbise
  await prisma.product.create({
    data: {
      title: "Bej Bisiklet Yaka Mini Elbise",
      productCode: "BGNELB-001",
      shortDesc: "Beige crew neck mini dress with elegant silhouette",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: elbise.id,
      subcategoryId: elbiseSub.id,
      sizeRange: "36-42",
      price: "120$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 5: Kahverengi Takım
  await prisma.product.create({
    data: {
      title: "Kahverengi Pantolonlu Takım",
      productCode: "1ya1ta0007-207",
      shortDesc: "Elegant brown suit with tailored pants",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: takim.id,
      subcategoryId: takimSub.id,
      sizeRange: "36-42",
      price: "185$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 3,
          },
        ],
      },
    },
  });

  // Product 6: Siyah Gömlek
  await prisma.product.create({
    data: {
      title: "Siyah Kadın Gömlek",
      productCode: "1ya1gm0006-228",
      shortDesc: "Classic black shirt with refined tailoring",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: ustgiyim.id,
      subcategoryId: gomlek.id,
      sizeRange: "36-42",
      price: "82$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 7: Koyu Yeşil Pantolon
  await prisma.product.create({
    data: {
      title: "Koyu Yeşil Klasik Pantolon",
      productCode: "4175-272-26W109",
      shortDesc: "Tailored pants in deep green with refined fit",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: altgiyim.id,
      subcategoryId: pantolon.id,
      sizeRange: "36-42",
      price: "95$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 8: Yeşil Pantolon
  await prisma.product.create({
    data: {
      title: "Yeşil Klasik Pantolon",
      productCode: "4188-272-26W101",
      shortDesc: "Classic tailored pants in green with elegant fit",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: altgiyim.id,
      subcategoryId: pantolon.id,
      sizeRange: "36-42",
      price: "95$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Product 9: Ekru Pantolon #2
  await prisma.product.create({
    data: {
      title: "Ekru Klasik Pantolon",
      productCode: "2146-192-26W101",
      shortDesc: "Classic tailored pants in ecru with refined details",
      mainImageUrl:
        "https://via.placeholder.com/800x1000.png?text=Product+Image",
      categoryId: altgiyim.id,
      subcategoryId: pantolon.id,
      sizeRange: "36-42",
      price: "95$",
      images: {
        create: [
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 1,
          },
          {
            imageUrl:
              "https://via.placeholder.com/800x1000.png?text=Product+Image",
            displayOrder: 2,
          },
        ],
      },
    },
  });

  console.log("✅ All 9 products created with images");

  // Create default admin user
  console.log("👤 Creating default admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.create({
    data: {
      email: "admin@Kiosk QR.com",
      password: hashedPassword,
      name: "Admin User",
    },
  });
  console.log(
    "✅ Admin user created (email: admin@Kiosk QR.com, password: admin123)",
  );

  // Seed all translations
  console.log("🌐 Seeding translations...");

  // Nested ceviri verisi — translations.ts ile ayni yapi
  const translationsNested: Record<string, Record<string, any>> = {
    en: {
      brand: "Kiosk QR",
      slogan: "Minimal Catalog Experience",
      attractMessage: "Touch to explore",
      back: "Back",
      filters: "Filters",
      search: "Search products...",
      allCategories: "All Categories",
      allTags: "All Tags",
      showingProducts: "Showing {count} products",
      searchByCode: "Search by product code...",
      noProducts: "No products found",
      similarProducts: "Similar Products",
      scrollForMore: "Scroll for more",
      images: "images",
      language: "Language",
      loading: "Loading...",
      errorLoading: "Error loading. Please try again.",
      errorLoadingProducts: "Error loading products. Please try again.",
      errorLoadingBrand: "Error loading brand. Please try again.",
      noBrands: "No brands added yet",
      productCode: "Product Code",
      seriesCount: "SERIES {count} PCS",
      seriesPcs: "{count} pcs",
      total: "Total",
      pcs: "pcs",
      product: {
        notFound: "Product not found",
        backToCatalog: "Back to Catalog",
        selectSize: "Select Size",
        selectColor: "Select Color",
        pleaseSelectSize: "Please select a size",
        pleaseSelectColor: "Please select a color",
        size: "Size",
        color: "Color",
        addToCart: "Add to Cart",
        addedToCart: "Added to Cart",
      },
      cart: {
        title: "Your Cart",
        empty: "Your cart is empty",
        emptyHint: "Start shopping to add items",
        total: "Total",
        checkout: "Complete Order",
        continueShopping: "Continue Shopping",
        remove: "Remove",
      },
      checkout: {
        title: "Your Cart",
        items: "items",
        product: "Product",
        price: "Price",
        quantity: "Quantity",
        total: "Total",
        orderSummary: "Order Summary",
        customerInfo: "Customer Information",
        fullName: "Full Name",
        email: "E-mail (optional)",
        phone: "Phone",
        address: "Address",
        submit: "Send Order",
        sending: "Sending...",
        startShopping: "Start Shopping",
        continueShopping: "Continue Shopping",
        emptyCart: "Your cart is empty",
        emptyCartHint: "Go back to catalog to add products",
        orderReceived: "ORDER RECEIVED",
        emailNotice: "You will be notified via WhatsApp.",
      },
      email: {
        newOrder: "NEW ORDER",
        customerInfo: "Customer Information",
        fullName: "Full Name",
        phone: "Phone",
        address: "Address",
        orderDetails: "Order Details",
        product: "Product",
        size: "Size",
        color: "Color",
        quantity: "Qty",
        price: "Price",
        total: "Total",
        orderConfirmed: "Your Order Has Been Received!",
        dear: "Dear",
        orderConfirmedMessage:
          "Your order has been successfully received. You can find your order details below.",
        subject: {
          newOrder: "New Order",
          orderConfirmed: "Your Order Has Been Received",
        },
      },
      categories: {
        furniture: "Furniture",
        lighting: "Lighting",
        decor: "Decor",
        outerwear: "Outerwear",
        tops: "Tops",
        bottoms: "Bottoms",
        dresses: "Dresses",
        ustgiyim: "Upper Garments",
        altgiyim: "Lower Garments",
        elbise: "Dresses & Jumpsuits",
        takim: "Suits",
        disgiyim: "Outerwear",
      },
      subcategories: {
        bluz: "BLOUSE",
        gomlek: "SHIRT",
        ceket: "JACKET & VEST",
        etek: "SKIRT",
        pantolon: "PANTS",
        elbise: "DRESS",
        takim: "SUIT",
      },
      tags: {
        modern: "Modern",
        seating: "Seating",
        minimalist: "Minimalist",
        workspace: "Workspace",
        wood: "Wood",
        ceramic: "Ceramic",
        ceiling: "Ceiling",
        glass: "Glass",
        art: "Art",
        storage: "Storage",
        floor: "Floor",
        dining: "Dining",
        textile: "Textile",
        accent: "Accent",
        mirror: "Mirror",
        luxury: "Luxury",
        plants: "Plants",
        bedroom: "Bedroom",
        blazer: "Blazer",
        women: "Women",
        coat: "Coat",
        shirt: "Shirt",
        trousers: "Trousers",
        sweater: "Sweater",
        dress: "Dress",
        blouse: "Blouse",
        pants: "Pants",
        vest: "Vest",
        skirt: "Skirt",
        turtleneck: "Turtleneck",
        jacket: "Jacket",
      },
    },
    tr: {
      brand: "Kiosk QR",
      slogan: "Minimal Katalog Deneyimi",
      attractMessage: "Keşfetmek için dokunun",
      back: "Geri",
      filters: "Filtreler",
      search: "Ürün ara...",
      allCategories: "Tüm Kategoriler",
      allTags: "Tüm Etiketler",
      showingProducts: "{count} ürün gösteriliyor",
      searchByCode: "Ürün kodu ile ara...",
      noProducts: "Ürün bulunamadı",
      similarProducts: "Benzer Ürünler",
      scrollForMore: "Daha fazla için kaydır",
      images: "görsel",
      language: "Dil",
      loading: "Yükleniyor...",
      errorLoading: "Yüklenemedi. Lütfen tekrar deneyin.",
      errorLoadingProducts: "Ürünler yüklenemedi. Lütfen tekrar deneyin.",
      errorLoadingBrand: "Marka yüklenemedi. Lütfen tekrar deneyin.",
      noBrands: "Henüz marka eklenmemiş",
      productCode: "Ürün Kodu",
      seriesCount: "SERİ {count} ADET",
      seriesPcs: "{count} ad",
      total: "Toplam",
      pcs: "ad",
      product: {
        notFound: "Urun bulunamadi",
        backToCatalog: "Kataloga Don",
        selectSize: "Beden Seciniz",
        selectColor: "Renk Seciniz",
        pleaseSelectSize: "Lutfen bir beden secin",
        pleaseSelectColor: "Lutfen bir renk secin",
        size: "Beden",
        color: "Renk",
        addToCart: "Sepete Ekle",
        addedToCart: "Sepete Eklendi",
      },
      cart: {
        title: "Sepetiniz",
        empty: "Sepetiniz bos",
        emptyHint: "Urun eklemek icin alisverise baslayin",
        total: "Toplam",
        checkout: "Siparisi Tamamla",
        continueShopping: "Alisverise Devam Et",
        remove: "Kaldir",
      },
      checkout: {
        title: "Sepetiniz",
        items: "urun",
        product: "Urun",
        price: "Fiyat",
        quantity: "Adet",
        total: "Toplam",
        orderSummary: "Siparis Ozeti",
        customerInfo: "Musteri Bilgileri",
        fullName: "Ad Soyad",
        email: "E-posta (opsiyonel)",
        phone: "Telefon",
        address: "Adres",
        submit: "Siparisi Gonder",
        sending: "Gonderiliyor...",
        startShopping: "Alisverise Basla",
        continueShopping: "Alisverise Devam Et",
        emptyCart: "Sepetiniz bos",
        emptyCartHint: "Urun eklemek icin kataloga donun",
        orderReceived: "SIPARIS ALINDI",
        emailNotice: "WhatsApp uzerinden bilgilendirileceksiniz.",
      },
      email: {
        newOrder: "YENI SIPARIS",
        customerInfo: "Musteri Bilgileri",
        fullName: "Ad Soyad",
        phone: "Telefon",
        address: "Adres",
        orderDetails: "Siparis Detaylari",
        product: "Urun",
        size: "Beden",
        color: "Renk",
        quantity: "Adet",
        price: "Fiyat",
        total: "Toplam",
        orderConfirmed: "Siparisiniz Alindi!",
        dear: "Sayin",
        orderConfirmedMessage:
          "Siparisiniz basariyla alindi. Asagida siparis detaylarinizi bulabilirsiniz.",
        subject: {
          newOrder: "Yeni Siparis",
          orderConfirmed: "Siparisiniz Alindi",
        },
      },
      categories: {
        furniture: "Mobilya",
        lighting: "Aydınlatma",
        decor: "Dekorasyon",
        outerwear: "Dış Giyim",
        tops: "Üst Giyim",
        bottoms: "Alt Giyim",
        dresses: "Elbiseler",
        ustgiyim: "Üst Giyim",
        altgiyim: "Alt Giyim",
        elbise: "Elbise & Tulum",
        takim: "Takım",
        disgiyim: "Dış Giyim",
      },
      subcategories: {
        bluz: "BLUZ",
        gomlek: "GÖMLEK",
        ceket: "CEKET & YELEK",
        etek: "ETEK",
        pantolon: "PANTOLON",
        elbise: "ELBİSE",
        takim: "TAKIM",
      },
      tags: {
        modern: "Modern",
        seating: "Oturma",
        minimalist: "Minimalist",
        workspace: "Çalışma Alanı",
        wood: "Ahşap",
        ceramic: "Seramik",
        ceiling: "Tavan",
        glass: "Cam",
        art: "Sanat",
        storage: "Depolama",
        floor: "Zemin",
        dining: "Yemek",
        textile: "Tekstil",
        accent: "Aksesuar",
        mirror: "Ayna",
        luxury: "Lüks",
        plants: "Bitki",
        bedroom: "Yatak Odası",
        blazer: "Blazer",
        women: "Kadın",
        coat: "Kaban",
        shirt: "Gömlek",
        trousers: "Pantolon",
        sweater: "Kazak",
        dress: "Elbise",
        blouse: "Bluz",
        pants: "Pantolon",
        vest: "Yelek",
        skirt: "Etek",
        turtleneck: "Balıkçı Yaka",
        jacket: "Ceket",
      },
    },
    ru: {
      brand: "Kiosk QR",
      slogan: "Минимальный Каталог",
      attractMessage: "Нажмите для просмотра",
      back: "Назад",
      filters: "Фильтры",
      search: "Поиск товаров...",
      allCategories: "Все Категории",
      allTags: "Все Теги",
      showingProducts: "Показано {count} товаров",
      searchByCode: "Поиск по коду товара...",
      noProducts: "Товары не найдены",
      similarProducts: "Похожие Товары",
      scrollForMore: "Прокрутите для продолжения",
      images: "изображения",
      language: "Язык",
      loading: "Загрузка...",
      errorLoading: "Ошибка загрузки. Попробуйте снова.",
      errorLoadingProducts: "Ошибка загрузки товаров. Попробуйте снова.",
      errorLoadingBrand: "Ошибка загрузки бренда. Попробуйте снова.",
      noBrands: "Бренды ещё не добавлены",
      productCode: "Код товара",
      seriesCount: "СЕРИЯ {count} ШТ",
      seriesPcs: "{count} шт",
      total: "Итого",
      pcs: "шт",
      product: {
        notFound: "Товар не найден",
        backToCatalog: "Вернуться в каталог",
        selectSize: "Выберите размер",
        selectColor: "Выберите цвет",
        pleaseSelectSize: "Пожалуйста, выберите размер",
        pleaseSelectColor: "Пожалуйста, выберите цвет",
        size: "Размер",
        color: "Цвет",
        addToCart: "В корзину",
        addedToCart: "Добавлено",
      },
      cart: {
        title: "Ваша корзина",
        empty: "Корзина пуста",
        emptyHint: "Начните покупки, чтобы добавить товары",
        total: "Итого",
        checkout: "Оформить заказ",
        continueShopping: "Продолжить покупки",
        remove: "Удалить",
      },
      checkout: {
        title: "Ваша корзина",
        items: "товаров",
        product: "Товар",
        price: "Цена",
        quantity: "Кол-во",
        total: "Итого",
        orderSummary: "Сводка заказа",
        customerInfo: "Информация о клиенте",
        fullName: "Имя Фамилия",
        email: "E-mail (необязательно)",
        phone: "Телефон",
        address: "Адрес",
        submit: "Отправить заказ",
        sending: "Отправка...",
        startShopping: "Начать покупки",
        continueShopping: "Продолжить покупки",
        emptyCart: "Корзина пуста",
        emptyCartHint: "Вернитесь в каталог, чтобы добавить товары",
        orderReceived: "ЗАКАЗ ПРИНЯТ",
        emailNotice: "Вы будете уведомлены через WhatsApp.",
      },
      email: {
        newOrder: "НОВЫЙ ЗАКАЗ",
        customerInfo: "Информация о клиенте",
        fullName: "Имя Фамилия",
        phone: "Телефон",
        address: "Адрес",
        orderDetails: "Детали заказа",
        product: "Товар",
        size: "Размер",
        color: "Цвет",
        quantity: "Кол-во",
        price: "Цена",
        total: "Итого",
        orderConfirmed: "Ваш заказ принят!",
        dear: "Уважаемый(ая)",
        orderConfirmedMessage:
          "Ваш заказ успешно принят. Ниже вы найдете детали вашего заказа.",
        subject: {
          newOrder: "Новый заказ",
          orderConfirmed: "Ваш заказ принят",
        },
      },
      categories: {
        furniture: "Мебель",
        lighting: "Освещение",
        decor: "Декор",
        outerwear: "Верхняя Одежда",
        tops: "Верх",
        bottoms: "Низ",
        dresses: "Платья",
        ustgiyim: "Верхняя Одежда",
        altgiyim: "Нижняя Одежда",
        elbise: "Платья и Комбинезоны",
        takim: "Костюмы",
        disgiyim: "Верхняя Одежда",
      },
      subcategories: {
        bluz: "БЛУЗКА",
        gomlek: "РУБАШКА",
        ceket: "ЖАКЕТ И ЖИЛЕТ",
        etek: "ЮБКА",
        pantolon: "БРЮКИ",
        elbise: "ПЛАТЬЕ",
        takim: "КОСТЮМ",
      },
      tags: {
        modern: "Современный",
        seating: "Сидение",
        minimalist: "Минималистский",
        workspace: "Рабочее Пространство",
        wood: "Дерево",
        ceramic: "Керамика",
        ceiling: "Потолок",
        glass: "Стекло",
        art: "Искусство",
        storage: "Хранение",
        floor: "Пол",
        dining: "Обеденный",
        textile: "Текстиль",
        accent: "Акцент",
        mirror: "Зеркало",
        luxury: "Роскошь",
        plants: "Растения",
        bedroom: "Спальня",
        blazer: "Блейзер",
        women: "Женщины",
        coat: "Пальто",
        shirt: "Рубашка",
        trousers: "Брюки",
        sweater: "Свитер",
        dress: "Платье",
        blouse: "Блузка",
        pants: "Брюки",
        vest: "Жилет",
        skirt: "Юбка",
        turtleneck: "Водолазка",
        jacket: "Жакет",
      },
    },
  };

  // Nested objeyi flat dot-notation formatina cevir
  function flattenObj(
    obj: Record<string, any>,
    prefix = "",
  ): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null) {
        Object.assign(result, flattenObj(obj[key], fullKey));
      } else {
        result[fullKey] = String(obj[key]);
      }
    }
    return result;
  }

  // { "key": { "en": "...", "tr": "...", "ru": "..." } } formatina donustur
  const langs = ["en", "tr", "ru"];
  const flatTranslations: Record<string, Record<string, string>> = {};
  for (const lang of langs) {
    const flat = flattenObj(translationsNested[lang]);
    for (const [key, value] of Object.entries(flat)) {
      if (!flatTranslations[key]) flatTranslations[key] = {};
      flatTranslations[key][lang] = value;
    }
  }

  const translationsPayload = {
    data: flatTranslations,
    languages: langs,
    activeLanguages: langs,
  };

  await prisma.settings.upsert({
    where: { key: "translations" },
    update: { value: JSON.stringify(translationsPayload) },
    create: { key: "translations", value: JSON.stringify(translationsPayload) },
  });
  console.log(
    `✅ ${Object.keys(flatTranslations).length} translation keys seeded (${langs.join(", ")})`,
  );

  // Seed color translations
  console.log("🎨 Seeding color translations...");
  const colorTranslations: Record<string, Record<string, string>> = {
    // Temel renkler
    siyah: { tr: "Siyah", en: "Black", ru: "Чёрный" },
    beyaz: { tr: "Beyaz", en: "White", ru: "Белый" },
    kirmizi: { tr: "Kırmızı", en: "Red", ru: "Красный" },
    mavi: { tr: "Mavi", en: "Blue", ru: "Синий" },
    yesil: { tr: "Yeşil", en: "Green", ru: "Зелёный" },
    sari: { tr: "Sarı", en: "Yellow", ru: "Жёлтый" },
    turuncu: { tr: "Turuncu", en: "Orange", ru: "Оранжевый" },
    mor: { tr: "Mor", en: "Purple", ru: "Фиолетовый" },
    pembe: { tr: "Pembe", en: "Pink", ru: "Розовый" },
    gri: { tr: "Gri", en: "Gray", ru: "Серый" },
    kahverengi: { tr: "Kahverengi", en: "Brown", ru: "Коричневый" },
    bej: { tr: "Bej", en: "Beige", ru: "Бежевый" },
    lacivert: { tr: "Lacivert", en: "Navy", ru: "Тёмно-синий" },
    bordo: { tr: "Bordo", en: "Burgundy", ru: "Бордовый" },
    ekru: { tr: "Ekru", en: "Ecru", ru: "Экрю" },
    krem: { tr: "Krem", en: "Cream", ru: "Кремовый" },
    // Tonlar
    "koyu yesil": { tr: "Koyu Yeşil", en: "Dark Green", ru: "Тёмно-зелёный" },
    "koyu mavi": { tr: "Koyu Mavi", en: "Dark Blue", ru: "Тёмно-синий" },
    "acik mavi": { tr: "Açık Mavi", en: "Light Blue", ru: "Голубой" },
    "acik yesil": { tr: "Açık Yeşil", en: "Light Green", ru: "Светло-зелёный" },
    "acik pembe": { tr: "Açık Pembe", en: "Light Pink", ru: "Светло-розовый" },
    "koyu gri": { tr: "Koyu Gri", en: "Dark Gray", ru: "Тёмно-серый" },
    "acik gri": { tr: "Açık Gri", en: "Light Gray", ru: "Светло-серый" },
    "koyu kahverengi": {
      tr: "Koyu Kahverengi",
      en: "Dark Brown",
      ru: "Тёмно-коричневый",
    },
    // Moda renkleri
    taba: { tr: "Taba", en: "Tan", ru: "Рыжевато-коричневый" },
    murdum: { tr: "Mürdüm", en: "Plum", ru: "Сливовый" },
    kiremit: { tr: "Kiremit", en: "Brick", ru: "Кирпичный" },
    haki: { tr: "Haki", en: "Khaki", ru: "Хаки" },
    mint: { tr: "Mint", en: "Mint", ru: "Мятный" },
    lila: { tr: "Lila", en: "Lilac", ru: "Сиреневый" },
    turkuaz: { tr: "Turkuaz", en: "Turquoise", ru: "Бирюзовый" },
    fusya: { tr: "Fuşya", en: "Fuchsia", ru: "Фуксия" },
    mercan: { tr: "Mercan", en: "Coral", ru: "Коралловый" },
    altin: { tr: "Altın", en: "Gold", ru: "Золотой" },
    gumus: { tr: "Gümüş", en: "Silver", ru: "Серебряный" },
    indigo: { tr: "İndigo", en: "Indigo", ru: "Индиго" },
    antrasit: { tr: "Antrasit", en: "Charcoal", ru: "Антрацитовый" },
    tarcin: { tr: "Tarçın", en: "Cinnamon", ru: "Коричный" },
    hardal: { tr: "Hardal", en: "Mustard", ru: "Горчичный" },
    petrol: { tr: "Petrol", en: "Teal", ru: "Бирюзово-зелёный" },
    pudra: { tr: "Pudra", en: "Powder Pink", ru: "Пудровый" },
    vizon: { tr: "Vizon", en: "Mink", ru: "Норковый" },
    camel: { tr: "Camel", en: "Camel", ru: "Верблюжий" },
    ten: { tr: "Ten", en: "Nude", ru: "Телесный" },
    "buz mavisi": { tr: "Buz Mavisi", en: "Ice Blue", ru: "Ледяной голубой" },
    "gul kurusu": { tr: "Gül Kurusu", en: "Dusty Rose", ru: "Пыльная роза" },
    tas: { tr: "Taş", en: "Stone", ru: "Каменный" },
    sampanya: { tr: "Şampanya", en: "Champagne", ru: "Шампань" },
    zeytin: { tr: "Zeytin", en: "Olive", ru: "Оливковый" },
    leylak: { tr: "Leylak", en: "Lavender", ru: "Лавандовый" },
    somon: { tr: "Somon", en: "Salmon", ru: "Лососёвый" },
    bakir: { tr: "Bakır", en: "Copper", ru: "Медный" },
    celik: { tr: "Çelik", en: "Steel", ru: "Стальной" },
  };

  await prisma.settings.upsert({
    where: { key: "color_translations" },
    update: { value: JSON.stringify(colorTranslations) },
    create: {
      key: "color_translations",
      value: JSON.stringify(colorTranslations),
    },
  });
  console.log(
    `✅ ${Object.keys(colorTranslations).length} color translations seeded`,
  );

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
