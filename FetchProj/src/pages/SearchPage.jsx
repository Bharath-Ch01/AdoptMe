import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SearchPage.css';

const SearchPage = ({ user }) => {
  const [breeds, setBreeds] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [filteredDogs, setFilteredDogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://frontend-take-home-service.fetch.com/dogs/breeds')
      .then(response => setBreeds(response.data))
      .catch(error => console.error('Error fetching breeds:', error));
  }, []);

  useEffect(() => {
    fetchDogs();
  }, [selectedBreed, sortOrder]);

  const fetchDogs = () => {
    let query = `https://frontend-take-home-service.fetch.com/dogs/search?size=50&sort=breed:${sortOrder}`;
    if (selectedBreed) {
      query += `&breeds=${selectedBreed}`;
    }
    axios.get(query, { withCredentials: true })
      .then(response => {
        axios.post('https://frontend-take-home-service.fetch.com/dogs', response.data.resultIds, { withCredentials: true })
          .then(res => {
            setDogs(res.data);
            setFilteredDogs(res.data);
          })
          .catch(error => console.error('Error fetching dog details:', error));
      })
      .catch(error => console.error('Error searching dogs:', error));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filtered = dogs.filter(dog => dog.breed.toLowerCase().includes(e.target.value.toLowerCase()));
    setFilteredDogs(filtered);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleLogout = async () => {
    await fetch('https://frontend-take-home-service.fetch.com/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/');
  };

  const nextSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % filteredDogs.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + filteredDogs.length) % filteredDogs.length);
  };

  return (
    <div className="search-container">
      <nav className="navbar">
        <div className="site-title">Adopt Me</div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </nav>
      <h2>Welcome, {user.name}!</h2>
      <div className="search-bar">
        <input type="text" placeholder="Search your puppy" value={searchTerm} onChange={handleSearch} />
      </div>
      <div className="filters">
        <select onChange={(e) => setSelectedBreed(e.target.value)} value={selectedBreed}>
          <option value="">All Breeds</option>
          {breeds.map(breed => (
            <option key={breed} value={breed}>{breed}</option>
          ))}
        </select>
        <button onClick={handleSort}>Sort {sortOrder === 'asc' ? '▲' : '▼'}</button>
      </div>
      <div className="carousel-container">
        <button className="carousel-button" onClick={prevSlide}>❮</button>
        <div className="dog-carousel">
          {filteredDogs.slice(currentIndex, currentIndex + 3).map(dog => (
            <div className="dog-card" key={dog.id}>
              <img className="dog-image" src={dog.img} alt={dog.name} />
              <div className="dog-info">
                <h3>{dog.name}</h3>
                <p>Breed: {dog.breed}</p>
                <p>Age: {dog.age}</p>
                <p>Location: {dog.zip_code}</p>
                <button className="favorite-button">❤️ Favorite</button>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-button" onClick={nextSlide}>❯</button>
      </div>
    </div>
  );
};

export default SearchPage;
