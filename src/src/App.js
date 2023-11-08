import { useEffect, useState } from 'react';
import './App.css';

// import { eventWrapper } from '@testing-library/user-event/dist/utils';

function Header(props) {
  return (
    <header>
      <h1><a href='/' onClick={(event)=>{
        event.preventDefault();
        props.onChangeMode();
      }}>{props.title}</a></h1>
    </header>
  );
}

function Nav(props) {
  const lis = [];
  for (let i = 0; i < props.topics.length; i++)
  {
    let tmp = props.topics[i];
    lis.push(
      <li key={tmp.id}>
      <a href={'/board/'+ tmp.id} onClick={(event)=>{
        event.preventDefault();
        props.onChangeMode(tmp.id);}}>
        {tmp.title}
      </a></li>
      );
  }
  return ( 
    <nav>
      <ol>{lis}</ol>
    </nav>
  );
}

function Article(props) {
  return (
    <article className='content'>
      <h2>
        {props.title}
      </h2>
      {props.contents}
    </article>
  );
}

function Create(props) {
  return <article>
    <h2>Create</h2>
    <form onSubmit={(event)=>{
      event.preventDefault();
      const title = event.target.title.value;
      const contents = event.target.contents.value;
      props.onCreate(title, contents);
    }}>
      <p><input type="text" name="title" placeholder="title"/></p>
      <p><textarea name="contents" placeholder='contents'></textarea></p>
      <p><input type='submit' value='Create'></input></p>
    </form>
  </article>
}

function Update(props){
  const [title, setTitle] = useState(props.title);
  const [contents, setcontents] = useState(props.contents);
  return <article>
    <h2>Update</h2>
    <form onSubmit={(event)=>{
      event.preventDefault();
      const title = event.target.title.value;
      const contents = event.target.contents.value;
      props.onUpdate(title, contents);
    }}>
      <p><input type="text" name="title" value={title} onChange={(event)=>{
        setTitle(event.target.value);
      }}/></p>
      <p><textarea name="contents" value={contents} onChange={(event)=>{
        setcontents(event.target.value);
      }}></textarea></p>
      <p><input type='submit' value='Update'></input></p>
    </form>
  </article>
}

function App() {
  const [mode, setMode] = useState('WELCOME');
  const [id, setId] = useState(null);
  const [topics, setTopics] = useState([
    {id:1, title: 'html', contents:'html is ...'},
    {id:2, title: 'css', contents:'css is ...'},
    {id:3, title: 'js', contents:'js is ...'},
  ]);
  const apiUrl = '';
  let content = null;
  let contentControl = null;

  const fetchTopics =  () => {
    fetch(`${apiUrl}/board/`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(
        data => {
          console.log(data);
          setTopics(data);
        })
      .catch(error => console.error(error));
  };

  useEffect(() => {
    fetchTopics(); // 컴포넌트가 마운트될 때 게시물 목록을 불러옵니다.
  }, []);

  useEffect(() => {
  }, [topics]);

  if (mode==='WELCOME'){
    content = <Article title='Welcome' contents="HELLO, WRTN"></Article>;
  } else if (mode === 'READ'){
    const foundTopic = topics.find(topic => topic.id === id);
      content = <Article title={foundTopic.title} contents={foundTopic.contents}></Article>;
      contentControl = <><li><a href={'/update/' + id} onClick={(event)=>{
        event.preventDefault();
        setMode('UPDATE');
      }}>UPDATE</a></li>
      <li><input type="button" value="Delete" onClick={()=>{ 
        fetch(`${apiUrl}/board/` + id, {
          method: "delete",
        })
          .then((res) => {res.text()})
          .then((res) => {
              setTopics(topics.filter((topic) => topic.id !== id));
              setMode('WELCOME');
          });
      }}></input></li>
      </>;

  } else if (mode === 'CREATE'){
    const handleCreate = (title, contents) => {
      const data = {title: title, contents: contents};
      console.log(data);
      console.log(JSON.stringify(data));
      fetch(`${apiUrl}/board/`, {
        method : "POST",          //메소드 지정
        headers : {               //데이터 타입 지정
            "Content-Type":"application/json; charset=utf-8"
        },
        body : JSON.stringify(data) 
      })
        .then(response => response.json())
        .then(newTopic => {
          console.log('새로운 게시물:', newTopic);
          const tmpTopics = topics.slice();
          tmpTopics.push(newTopic);
          setTopics(tmpTopics);
          setId(newTopic.id);
          setMode('READ');
        })
        .catch(error => console.error(error));
    };

    content = <Create onCreate={handleCreate}></Create>;

  } else if (mode === 'UPDATE'){
    const foundTopic = topics.find(topic => topic.id === id);
    content = <Update title={foundTopic.title} contents={foundTopic.contents} onUpdate={(title, contents)=>{
      const data = {title: title, contents: contents};
      fetch(`${apiUrl}/board/` + id, {
        method : "PATCH",          //메소드 지정
        headers : {               //데이터 타입 지정
            "Content-Type":"application/json; charset=utf-8"
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(newTopic => {
          console.log('새로운 게시물:', newTopic);
          const tmpTopics = topics.slice();
          for (let i = 0; i < topics.length; i++)
          {
            if (tmpTopics[i].id === id)
              tmpTopics[i] = newTopic;
          }
          setTopics(tmpTopics);
          setId(newTopic.id);
          setMode('READ');
        })
        .catch(error => console.error(error));
    }}></Update>
  }
  return (
    <div>
      <Header 
        title="HELLO WRTN WORLD" 
        onChangeMode={()=>{setMode('WELCOME');}}>
      </Header>
      <Nav topics={topics} onChangeMode={(_id)=>{
        setMode('READ');
        setId(_id)
      }}></Nav>
      {content}
      <p></p>
      <ul>
        <li><a href='/create' onClick={(event)=>{
            event.preventDefault();
            setMode('CREATE');
          }}>CREATE</a></li>
        {contentControl}
      </ul>
    </div>
  );
}

export default App;
