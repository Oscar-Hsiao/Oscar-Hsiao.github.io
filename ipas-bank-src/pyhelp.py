import io,contextlib,textwrap,re
def run(code):
    buf=io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(textwrap.dedent(code),{})
    return buf.getvalue().strip()
def P(code_id,code,wrongs,exp,diff=2,intro="執行下列程式，輸出會是什麼？",tag="指引"):
    code=textwrap.dedent(code).strip('\n')
    right=run(code)
    w=[x for x in wrongs if x!=right]
    assert len(w)>=3,(code_id,right,wrongs)
    w=w[:3]
    exp=re.sub(r'若你選對[，,]答案是[^。]*。?','',exp).strip()
    exp=exp+"（實際輸出："+right.replace("\n"," / ")+"）"
    return (tag,code_id,intro+"\n```\n"+code+"\n```",right,w,exp,diff,'Python')
