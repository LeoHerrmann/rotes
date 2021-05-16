import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './fontello/css/fontello.css';

class SortingMenu extends React.Component {
    render() {
        var menu = null;

        if (this.props.visible) {
            let optionGroups = [];

            for (let option of ["title", "created", "lastModified"]) {
                optionGroups.push(
                    <div key={option + "_group"}>
                        <input
                            id={option + "_radio"} type="radio" name="sortBy" value={option}
                            checked={this.props.sortBy === option} 
                            onChange={() => {this.props.changeSortBy(option)}}
                        />
                        <label htmlFor={option + "_radio"}>{option.charAt(0).toUpperCase() + option.slice(1)}</label>
                    </div>
                )
            }

            menu = 
                <div className="sortingMenu">
                    <div className="overlay" onClick={() => this.props.hide()}></div>

                    <div className="content">
                        <div>Sort By</div>
                        {optionGroups}
                    </div>
                </div>
        }

        return menu;
    }
}

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sortingMenuVisible: false
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.searchInputVisible === false && this.props.searchInputVisible === true) {
            this.searchInput.focus();            
        }
    }

    showSortingMenu = () => { //toggeln?
        this.setState({sortingMenuVisible: true});
    }

    hideSortingMenu = () => {
        this.setState({sortingMenuVisible: false});
    }

    render() {
        var header;

        if (this.props.view === "noteslist" && this.props.searchInputVisible) {
            header =
                <header className="search_view">
                    <button className="icon-back" onClick={() => this.props.toggleSearchInput()}></button>
                    <input type="text" placeholder="Search…" ref={inputEl => (this.searchInput = inputEl)}/>
                </header>;
        }

        else if (this.props.view === "noteslist") {
            header =
                <header className="notes_list_view">
                    <h1>Notes</h1>

                    <button className="icon-search" onClick={() => this.props.toggleSearchInput()}></button>
                    <button className="icon-sort" onClick={() => this.showSortingMenu()}></button>
                    <SortingMenu
                        sortBy = {this.props.sortBy}
                        changeSortBy = {this.props.changeSortBy}
                        visible={this.state.sortingMenuVisible}
                        hide={this.hideSortingMenu}
                    />
                </header>;
        }

        else if (this.props.view === "noteeditor") {
            header =
                <header className="edit_view">
                    <button className="icon-back" onClick={this.props.closeEditor}></button>
                    <h1>Edit</h1>
                </header>;
        }

        return (
            <div>
                {header}
                <div className="placeholder"></div>
            </div>
        );
    }
}

class NotesList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            menuVisible: false,
            menuID: null
        };
    }

    showMenu(e, id) {
        e.preventDefault();

        this.setState({
            menuVisible: true,
            menuID: id
        });
    }

    hideMenu() {
        this.setState({
            menuVisible: false,
            menuID: null
        });
    }

    render(props) {
        var listContent = <div className="placeholder_text">No notes</div>;
        var noteMenu;

        var notes = JSON.parse(JSON.stringify(this.props.notes));


        //sort notes
        if (this.props.sortBy === "created") {
            notes = notes.sort((a, b) => (a.created < b.created) ? 1 : -1);
        }

        else if (this.props.sortBy === "lastModified") {
            notes = notes.sort((a, b) => (a.lastModified < b.lastModified) ? 1 : -1);
        }

        else if (this.props.sortBy === "title") {
            notes = notes.sort((a, b) => {
                var titleA = a.title.toUpperCase();
                var titleB = b.title.toUpperCase();

                if (titleA < titleB) {
                    return -1;
                }
                else if (titleA > titleB) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
        }

        //list notes
        if (notes.length > 0) {
            listContent = [];

            for (let note of notes) {
                var displayDate = this.props.sortBy === "lastModified" ? 
                    "Last modified: " + new Date(note.lastModified).toLocaleString() :
                    "Created: " + new Date(note.created).toLocaleString();

                listContent.push(
                    <div
                        className="note"
                        key={note.id}
                        onClick={() => this.props.openNote(note.id)}
                        onContextMenu={(e) => this.showMenu(e, note.id)}
                    >
                        <div className="title">{note.title}</div>
                        <div className="date">{displayDate}</div>
                    </div>
                );
            }

            //menu
            if (this.state.menuVisible) {
                let noteTitle;

                for (let note of this.props.notes) {
                    if (note.id === this.state.menuID) {
                        noteTitle = note.title;
                        break;
                    }
                }

                noteMenu =
                    <div className="menu">
                        <div
                            className="overlay"
                            onClick={() => this.hideMenu()}
                        ></div>

                        <div className="content">
                            <h2>{noteTitle}</h2>
                            <div
                                className="text_negative"
                                onClick={() => {this.props.deleteNote(this.state.menuID); this.hideMenu();}}
                            >
                                <i className="icon-delete"></i>
                                Delete
                            </div>
                            <div onClick={() => this.hideMenu()}>
                                <i className="icon-cancel"></i>
                                Cancel
                            </div>
                        </div>
                    </div>;
            }
        }

        return (
            <div className="notes_list">
                {listContent}
                {noteMenu}
                <button className="icon-add primary" onClick={this.props.createNote}></button>
            </div>
        );
    }
}

class NoteEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            noteToEdit: props.noteToEdit
        };
    }

    componentDidUpdate() {
        if (this.props.noteToEdit.id !== this.state.noteToEdit.id) {
            this.setState({
                noteToEdit: this.props.noteToEdit
            });
        }
    }

    handleTitleChange = event => {
        this.setState({
            noteToEdit: {
                id: this.state.noteToEdit.id,
                title: event.target.value,
                content: this.state.noteToEdit.content,
                created: this.state.noteToEdit.created
            }
        });
    };

    handleContentChange = event => {
        this.setState({
            noteToEdit: {
                id: this.state.noteToEdit.id,
                title: this.state.noteToEdit.title,
                content: event.target.value,
                created: this.state.noteToEdit.created
            }
        });
    };

    render(props) {
        if (this.props.noteToEdit.id) {
            return (
                <div className="note_editor">
                    <input
                        value={this.state.noteToEdit.title}
                        onChange={this.handleTitleChange}
                        placeholder="Title"
                        type="text"
                    />
                    <textarea
                        value={this.state.noteToEdit.content}
                        onChange={this.handleContentChange}
                        placeholder="Content"
                    />
                    <button
                        className="save_note_button primary"
                        onClick={() => this.props.saveNote({
                            id: this.state.noteToEdit.id,
                            title: this.state.noteToEdit.title,
                            content: this.state.noteToEdit.content,
                            created: this.state.noteToEdit.created,
                            lastModified: new Date().toJSON()
                        })}
                    >
                        Save note
                    </button>
                </div>
            )
        }

        else {
            return null;
        }

    }
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            idCounter: 1,
            notes: [],
            editorID: null,
            sortBy: "created",
            searchInputVisible: false
        };

        var notesData = JSON.parse(localStorage.getItem("notesData"));

        if (notesData) {
            this.state.idCounter = notesData.idCounter;
            this.state.notes = notesData.notes;
            this.state.sortBy = notesData.sortBy;
        }
    }

    openNote(id) {
        this.setState({
            editorID: id
        });
    }

    createNote() {
        this.setState({
            editorID: this.state.idCounter,
            idCounter: this.state.idCounter + 1
        });
    }

    saveNote(note) {
        var editedNote = JSON.parse(JSON.stringify(note));
        var notes = JSON.parse(JSON.stringify(this.state.notes));
        var isNewNote = true;

        for (let i in notes) {
            if (notes[i].id === editedNote.id) {
                notes[i] = note;
                isNewNote = false;
                break;
            }
        }

        if (isNewNote) {
            notes.push(editedNote);
        }

        this.setState({notes: notes}, () => {
            this.saveToLocalStorage();
        });
    }

    deleteNote(id) {
        var notes = JSON.parse(JSON.stringify(this.state.notes));

        for (let i in notes) {
            if (notes[i].id === id) {
                notes.splice(i, 1);
                break;
            }
        }

        this.setState({notes: notes}, () => {
            this.saveToLocalStorage();
        });
    }

    saveToLocalStorage() {
        var notesData = {
            notes: this.state.notes,
            idCounter: this.state.idCounter,
            sortBy: this.state.sortBy
        };

        localStorage.setItem("notesData", JSON.stringify(notesData));
    }

    closeEditor() {
        this.setState({editorID: null});
    }

    changeSortBy(criterion) {
        this.setState({
            sortBy: criterion
        }, () => this.saveToLocalStorage());
    }

    toggleSearchInput() {
        if (this.state.searchInputVisible === false) {
            this.setState({
                searchInputVisible: true
            });
        }
        else {
            this.setState({
                searchInputVisible: false
            });
        }
    }

    render() {
        var noteToEdit = {
            id: this.state.editorID,
            title: "",
            content: "",
            created: new Date().toJSON()
        };

        for (let note of this.state.notes) {
            if (note.id === this.state.editorID) {
                noteToEdit = JSON.parse(JSON.stringify(note));
                break;
            }
        }

        var view = this.state.editorID ? "noteeditor" : "noteslist";
        var main_content;

        if (view === "noteslist") {
            main_content = 
                <NotesList
                    notes={this.state.notes}
                    sortBy={this.state.sortBy}
                    openNote={(e) => this.openNote(e)}
                    createNote={() => this.createNote()}
                    deleteNote={(e) => this.deleteNote(e)}
                />
        }
        else if (view === "noteeditor") {
            main_content =
                <NoteEditor
                    noteToEdit={noteToEdit}
                    saveNote={((e) => this.saveNote(e))}
                />
        }


        return (
            <div className="App">
                <Header
                    view={view}
                    searchInputVisible={this.state.searchInputVisible}
                    sortBy={this.state.sortBy}
                    closeEditor={() => this.closeEditor()}
                    changeSortBy={(e) => this.changeSortBy(e)}
                    toggleSearchInput={() => this.toggleSearchInput()}
                />
 
                {main_content}
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById("root")
);


/*
notesList = [
    {
        id: 99,
        title: "Title",
        content: "Content",
        created: "YYYY-MM-DD",
        lastModified: "YYYY-MM-DD"
    },
    ...
]
*/

/*
sort by lastModified:
notes.sort((a, b) => (a.lastModified < b.lastModified) ? 1 : -1)
*/
