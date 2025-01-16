## 📚 Kullanım

Uygulama başlatıldıktan sonra:
- Frontend: http://localhost:3001
- Backend: http://localhost:8080

### Örnek Sorgular
1. Hangi tanrılar birden fazla kutsal alanı yönetmektedir?
2. En yüksek hasar gücüne sahip silahlar hangileridir?
3. Hangi kahramanlar hangi silahları kullanmaktadır?
4. Kutsal alanlarda hangi nesneler bulunmaktadır?
5. Hangi tanrılar hangi kahramanlara güç vermektedir?

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## 📧 İletişim

Enes Yiğit - [GitHub](https://github.com/enes-yigit)

Proje Linki: [https://github.com/enes-yigit/Turkish-mythology-ontology](https://github.com/enes-yigit/Turkish-mythology-ontology)

## 🙏 Teşekkürler

- Türk mitolojisi kaynakları ve araştırmacıları
- Açık kaynak toplulukları
- Projeye katkıda bulunan tüm geliştiriciler

Frontend başarıyla başlatıldığında:
- http://localhost:3001 adresinde çalışacaktır
- Tarayıcınızda otomatik olarak açılacaktır

Olası Hatalar ve Çözümleri:
- `node_modules` ile ilgili hatalar: `rm -rf node_modules && npm install`
- Port 3001 kullanımda ise: `.env` dosyasında `PORT=3002` ekleyin
- Module not found hataları: `npm install` komutunu tekrar çalıştırın

### 4. Ontoloji Dosyası Kontrolü

Backend'in ontoloji dosyasını doğru şekilde okuduğundan emin olmak için:

1. `backend/src/main/resources/` dizininde `ontology.owl` dosyasının var olduğunu kontrol edin
2. http://localhost:8080/api/ontology/test endpoint'ini tarayıcınızda açın
3. Başarılı bir yanıt almalısınız

### 5. Sistem Testi

Kurulum başarılı ise:

1. Frontend: http://localhost:3001 adresine gidin
2. Soldaki menüden bir sorgu seçin
3. "Sorgula" butonuna tıklayın
4. Sonuçları tablo formatında görmelisiniz

## 💡 Geliştirme İpuçları

### Backend Geliştirme
- `backend/src/main/java/com/ontology/api/controller/` dizininde controller'ları bulabilirsiniz
- Yeni SPARQL sorguları eklemek için `OntologyController.java` dosyasını düzenleyin
- Ontoloji modelini güncellemek için Protégé kullanabilirsiniz

### Frontend Geliştirme
- `frontend/src/App.js` ana uygulama bileşenini içerir
- `frontend/src/components/` dizininde diğer bileşenleri bulabilirsiniz
- Yeni sorgular eklemek için `competencyQuestions` array'ini güncelleyin

### Ontoloji Geliştirme
- Ontoloji dosyası: `backend/src/main/resources/ontology.owl`
- Protégé ile düzenleyebilirsiniz
- Değişikliklerden sonra backend'i yeniden başlatın

## 🔍 Test Etme

Kurulumun başarılı olduğunu kontrol etmek için:

1. Backend Testi:
```bash
curl http://localhost:8080/api/ontology/test
```