import React, { useState, useCallback, useEffect } from 'react';
import { authorService } from '../../services/authorService.ts';
import { genreService } from '../../services/genreService.ts';
import { Author } from '../../types/author.types.ts';
import { Genre } from '../../types/genre.types.ts';
import '../../styles/books/BookFilter.css';

interface BookFilterProps {
  onApply: (filters: any) => void;
}

interface FilterData {
  searchTitle: string;
  filterAuthorId: string;
  filterGenreId: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const BookFilter: React.FC<BookFilterProps> = ({ onApply }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [filterData, setFilterData] = useState<FilterData>({
    searchTitle: '',
    filterAuthorId: '',
    filterGenreId: '',
    sortBy: 'title',
    sortOrder: 'asc',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorsData, genresData] = await Promise.all([
          authorService.getAllAuthors(),
          genreService.getAllGenres(),
        ]);
        setAuthors(authorsData);
        setGenres(genresData);
      } catch (error) {
        // Silently handle error
      }
    };

    fetchData();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFilterData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    const filters: any = {};
    if (filterData.searchTitle) filters.searchTitle = filterData.searchTitle;
    if (filterData.filterAuthorId) filters.filterAuthorId = filterData.filterAuthorId;
    if (filterData.filterGenreId) filters.filterGenreId = filterData.filterGenreId;
    if (filterData.sortBy) filters.sortBy = filterData.sortBy;
    if (filterData.sortOrder) filters.sortOrder = filterData.sortOrder;

    onApply(filters);
  }, [filterData, onApply]);

  const handleReset = useCallback(() => {
    setFilterData({
      searchTitle: '',
      filterAuthorId: '',
      filterGenreId: '',
      sortBy: 'title',
      sortOrder: 'asc',
    });
    onApply({});
  }, [onApply]);

  return (
    <div className="book-filter">
      <button
        className="filter-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '▼' : '▶'} Filters
      </button>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-group">
            <label htmlFor="searchTitle">Search by Title</label>
            <input
              id="searchTitle"
              type="text"
              name="searchTitle"
              value={filterData.searchTitle}
              onChange={handleChange}
              placeholder="Enter book title"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filterAuthorId">Author</label>
            <select
              id="filterAuthorId"
              name="filterAuthorId"
              value={filterData.filterAuthorId}
              onChange={handleChange}
            >
              <option value="">All Authors</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.firstName} {author.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filterGenreId">Genre</label>
            <select
              id="filterGenreId"
              name="filterGenreId"
              value={filterData.filterGenreId}
              onChange={handleChange}
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sortBy">Sort By</label>
            <select
              id="sortBy"
              name="sortBy"
              value={filterData.sortBy}
              onChange={handleChange}
            >
              <option value="title">Title</option>
              <option value="publishedYear">Published Year</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sortOrder">Order</label>
            <select
              id="sortOrder"
              name="sortOrder"
              value={filterData.sortOrder}
              onChange={handleChange}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="filter-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
